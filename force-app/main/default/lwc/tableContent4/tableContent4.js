import { LightningElement, api, track } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TableContent3 extends LightningElement {
    @api account
    @api disableNameColumn
    @api disableRatingColumn
    @api footerState = false
    @track nameToDisplay = ''
    @track ratingToDisplay = ''
    

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

    getCurrentRowValues(){
        let name = this.template.querySelector('[title=Name]').value
        let rating = this.template.querySelector('[title=Rating').value
        return [name, rating]
    }

    changeCellColor(cell, color){
        cell.style.backgroundColor = color
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