import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/accountController4.getAccounts'
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import RATING_FIELD from '@salesforce/schema/Account.Rating';
import ID_FIELD from '@salesforce/schema/Account.Id';

const editButtonsId = ['Name', 'Rating']
const columnsLabels = ['Name', 'Rating'] 

export default class Table3 extends LightningElement {
    @track accounts
    @track loadedAccounts = undefined
    @track rows = {Name : [], Rating: []}
    @track showFooter = false
    @track getAccountsResponse


    @wire(getAccounts)getAccountsHandler(response){
        this.getAccountsResponse = response
        if(response.error){
            this.dispatchErrorToast('Accounts cant be uploaded')
        }
        if(!this.loadedAccounts){
            this.loadedAccounts = response.data
        }
        if(this.loadedAccounts){
            this.accounts = response.data.filter((account) => {
                return this.loadedAccounts.find((acc) => acc.Id == account.Id)
            })
        }
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

    switchFooterState(){
        this.showFooter = !this.showFooter
    }

    refreshContentAfterEdit(){
        refreshApex(this.getAccountsResponse).then(() => {
            this.switchFooterState()
            this.activateAllEditButtons()
            this.dispatchSuccessToast('Accounts was updated')
        })       
    }

    refreshContentAfterDelete(){
        refreshApex(this.getAccountsResponse)
        .then(() => console.log(5))       
    }

    updateAllRows(){
        let allAccounts = {}
        columnsLabels.forEach((columnName) => {
            this.rows[columnName].forEach((row) => {
                let realAccountId = row.id.split('-')[0]
                if(!allAccounts.hasOwnProperty(realAccountId)){
                    Object.defineProperty(allAccounts, realAccountId,  {
                        value: {Name : '', Rating : ''},
                        writable: true,
                        enumerable: true,
                        configurable: true})
                 }
                allAccounts[realAccountId][columnName] = row.innerHTML
            })
        })
        
        this.accounts.forEach((account) => {
            let accountName = ''
            let accountRating = ''
            if(account.hasOwnProperty('Name')){
                accountName = account.Name
            }
            if(account.hasOwnProperty('Rating')){
                accountRating = account.Rating
            }
            allAccounts[account.Id]['oldName'] = accountName
            allAccounts[account.Id]['oldRating'] = accountRating
        })
        
        let allAccountsId = Object.keys(allAccounts)
        let allPromises = []
        allAccountsId.forEach((accountId) => {
            let oldName = allAccounts[accountId]['oldName']
            let oldRating = allAccounts[accountId]['oldRating']
            let name = allAccounts[accountId]['Name']
            let rating = allAccounts[accountId]['Rating']
            if((oldName == name) && (oldRating == rating)){
                return
            }
            let fields = {}
            fields[ID_FIELD.fieldApiName] = accountId
            fields[NAME_FIELD.fieldApiName] = name
            fields[RATING_FIELD.fieldApiName] = rating
            const recordInput = { fields }
            allPromises.push(updateRecord(recordInput))
            }
        )
        
        Promise.all(allPromises)
        .then(() => {
            this.refreshContentAfterEdit()
        })
        .catch(() => {
            this.switchFooterState()
            this.activateAllEditButtons()
            this.dispatchErrorToast('Accounts was not updated\n Try refresh page')
        })
    }

    closeFooterHandler(){
        this.switchFooterState()
        this.activateAllEditButtons()
    }

    saveFooterHandler(){
        this.updateAllRows()
    }

    deleteHandler(event){
        console.log(1)
        let deletedAccountId = event.detail
        console.log(2)
        this.loadedAccounts = this.loadedAccounts.filter((item) => item.Id != deletedAccountId)
        console.log(3)
        this.accounts = this.accounts.filter((item) => item.Id != deletedAccountId)
        console.log(4)
        this.refreshContentAfterDelete()
    }

    onMouseOverHandler(event){
        let columnEditButton = event.target.querySelector('.slds-button')
        columnEditButton.style.visibility = 'visible'
    }

    onMouseOutHandler(event){
        let columnEditButton = event.target.querySelector('.slds-button')
        columnEditButton.style.visibility = 'hidden'
    }

    capitalizeFirstLetter(str){
        return str[0].toUpperCase() + str.slice(1);
    }

    disableEditButtons(){
        let editButtons = this.template.querySelectorAll(`[type=editButton]`)
        editButtons.forEach((button) => {
            button.disabled = true
        })
    }

    activateAllEditButtons(){
        let editButtons = this.template.querySelectorAll(`[type=editButton]`)
        editButtons.forEach((button) => {
            button.disabled = false
        })
    }

    onEditButtonHandler(event){
        let buttonId = event.target.id.split('-')[0]
        let columnName = buttonId.slice(0, -1)
        columnName = this.capitalizeFirstLetter(columnName)
        this.makeAllColumnEditable(columnName)
        this.disableEditButtons()
        this.showFooter = true
    }

    onAddRowHandler(event){
        let newRow = event.detail
        this.rows[newRow.title] = [...this.rows[newRow.title], newRow.content]
    }

    makeAllColumnEditable(columnName){
        this.rows[columnName].forEach((elem) => {
            elem.setAttribute('contentEditable', 'true')
        })
    }
    

}