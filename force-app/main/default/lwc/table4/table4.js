import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/accountController4.getAccounts'
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import RATING_FIELD from '@salesforce/schema/Account.Rating';
import ID_FIELD from '@salesforce/schema/Account.Id';

const columnsLabels = ['Name', 'Rating'] 

export default class Table3 extends LightningElement {
    @track accounts
    @track loadedAccounts = undefined
    @track showFooter = false
    @track getAccountsResponse
    @track editButtonsDisabled = false
    @track accountsForEditing = {}
    @track columnThatEditingNow = ''

    @wire(getAccounts)getAccountsHandler(response){
        this.getAccountsResponse = response
        if(response.error){
            this.dispatchErrorToast('Accounts cant be uploaded')
        }
        if(!this.loadedAccounts){
            this.loadedAccounts = response.data
        }
        if(this.loadedAccounts){
            this.rows = {Name : [], Rating: []}
            this.accounts = response.data.filter((account) => {
                return this.loadedAccounts.find((acc) => acc.Id == account.Id)
            })
        }
    }

    updateRows(){
        let allUpdates = []
        let accountsToUpdate = this.getObjectFromProxy(this.accountsForEditing)
        let allAccountsId = Object.keys(accountsToUpdate)
        allAccountsId.forEach((id) => {
            let fields = {}
            fields[ID_FIELD.fieldApiName] = id
            fields[NAME_FIELD.fieldApiName] = accountsToUpdate[id].name
            fields[RATING_FIELD.fieldApiName] = accountsToUpdate[id].rating
            allUpdates.push(updateRecord({fields}))
        })
        Promise.all(allUpdates)
        .then(() => {
            this.refreshContentAfterEdit()
        })
        .catch(() => {
            this.dispatchSuccessToast('Accounts was not updated')
            this.switchFooterState()
            this.switchEditButtonsStatus()
        })
    }

    refreshContentAfterEdit(){
        refreshApex(this.getAccountsResponse).then(() => {
            this.switchFooterState()
            this.dispatchSuccessToast('Accounts was updated')
            this.switchEditButtonsStatus()
        })       
    }

    refreshContentAfterDelete(){
        refreshApex(this.getAccountsResponse)           
    }

    switchEditButtonsStatus(){
        this.editButtonsDisabled = !this.editButtonsDisabled
    }

    switchFooterState(){
        this.showFooter = !this.showFooter
    }

    closeFooterHandler(){
        this.switchFooterState()
        this.switchEditButtonsStatus()
    }

    saveFooterHandler(){
        this.updateRows()
    }

    deleteHandler(event){
        let deletedAccountId = event.detail
        this.loadedAccounts = this.loadedAccounts.filter((item) => item.Id != deletedAccountId)
        this.refreshContentAfterDelete()
    }

    handleEditButtonPressed(){
        this.switchEditButtonsStatus()
        this.switchFooterState()
    }

    rowEditedHandler(event){
        let accountInformation = event.detail
        let [accountId, accountName, accountRating] = Object.values(accountInformation)
        this.accountsForEditing[accountId] = {name : accountName, rating : accountRating} 
    }  

    dispatchSuccessToast(message){
        const event = new ShowToastEvent({
            title: 'Deletion feedback',
            message: `${message}`,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    dispatchErrorToast(message){
        const event = new ShowToastEvent({
            title: 'Deletion feedback',
            message: `${message}`,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    capitalizeFirstLetter(str){
        return str[0].toUpperCase() + str.slice(1);
    }

    getObjectFromProxy(object){
        return JSON.parse(JSON.stringify(object))
    }
}