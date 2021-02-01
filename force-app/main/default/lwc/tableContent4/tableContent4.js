import { LightningElement, api, track } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TableContent3 extends LightningElement {
    @api account
    @api footerShowed = false
    @api editButtonsDisabled = false
    @track nameToDisplay = ''
    @track ratingToDisplay = ''
    @track disableNameColumn = true
    @track disableRatingColumn = true

    @api
    get footerState(){
       return this.footerState 
    }
    set footerState(value){
        this.footerShowed = value
        if(value == true){
            return
        }
        if(this.disableNameColumn == false){
            this.switchNameInputStatus()
        }
        if(this.disableRatingColumn == false){
            this.switchRatingInputStatus()
        }
    }

    renderedCallback(){
        if(this.account){
            [this.nameToDisplay, this.ratingToDisplay] = this.getAccountFields()
            this.returnRowSettingsToDefault()
        }
    }

    returnRowSettingsToDefault(){
        const cells = this.getAllCells()
        cells.forEach((elem) => {
            if(!elem){
                return
            }
            this.changeCellColor(elem, null)
        })
    }

    handleDeleteRecord(event){
        let deleteId = this.account.Id
        deleteRecord(deleteId)
        .then(() => {
            this.dispatchEvent(new CustomEvent('delete', {detail : this.account.Id}))
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted successfully',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Failure',
                    message: 'Account was not deleted',
                    variant: 'error'
                })
            );
        });
    }

    onMouseOutHandler(event){
        let columnEditButton = event.target.querySelector('.slds-button')
        columnEditButton.style.visibility = 'hidden'
    }

    onMouseOverHandler(event){
        let columnEditButton = event.target.querySelector('.slds-button')
        columnEditButton.style.visibility = 'visible'
    }

    nameChangeHandler(event){
        let currentName = event.target.value
        this.changeCellColor(event.target, 'yellow')
        let [rowName, rowRating] = this.getCurrentRowValues()
        this.dispatchEvent(new CustomEvent('rowedited', {detail : {
            id: this.account.Id,
            name: rowName,
            rating: rowRating
        }}))
    }

    ratingChangeHandler(event){
        let currentRating = event.target.value
        this.changeCellColor(event.target, 'yellow')
        let [rowName, rowRating] = this.getCurrentRowValues()
        this.dispatchEvent(new CustomEvent('rowedited', {detail : {
            id: this.account.Id,
            name: rowName,
            rating: rowRating
        }}))
    }

    onEditButtonHandler(event){
        let buttonType = event.target.getAttribute('type')
        if(buttonType == 'name'){
            this.switchNameInputStatus()
        }
        if(buttonType == 'rating'){
            this.switchRatingInputStatus()
        }
        this.dispatchEvent(new CustomEvent('editbtnpressed'))
    }

    getCurrentRowValues(){
        let name = this.template.querySelector('[title=Name]').value
        let rating = this.template.querySelector('[title=Rating').value
        return [name, rating]
    }

    changeCellColor(cell, color){
        cell.style.backgroundColor = color
    }

    switchNameInputStatus(){
        this.disableNameColumn = !this.disableNameColumn
    }

    switchRatingInputStatus(){
        this.disableRatingColumn = !this.disableRatingColumn
    }

    getAllCells(){
        let nameRow = this.template.querySelector('[title=Name]')
        let ratingRow = this.template.querySelector('[title=Rating]')
        return [nameRow, ratingRow]
    }

    getAccountFields(){
        let [name, rating] = ['', '']
        if(this.account.hasOwnProperty('Name'))name = this.account.Name
        if(this.account.hasOwnProperty('Rating'))rating = this.account.Rating
        return [name, rating]
    }
}