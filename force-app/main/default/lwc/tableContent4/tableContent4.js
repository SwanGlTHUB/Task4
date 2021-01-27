import { LightningElement, api, track } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TableContent3 extends LightningElement {
    @api account
    @track hasRendered = false
    @track footer = false

    @api
    get footerState(){
        return this.footer
    }

    set footerState(value){
        this.footer = value
        if(!this.hasRendered)return
        if(value == false){
            this.returnRowInDefault()
        }
    }

    returnRowInDefault(){
        let nameRow = this.template.querySelector('[title=Name]')
        let ratingRow = this.template.querySelector('[title=Rating]')
        nameRow.innerHTML = this.account.Name || ''
        ratingRow.innerHTML = this.account.Rating || ''
        nameRow.style.backgroundColor = ''
        ratingRow.style.backgroundColor = ''
        nameRow.setAttribute('contentEditable', false)
        ratingRow.setAttribute('contentEditable', false)
    }

    renderedCallback(){
        if(!this.hasRendered){
            this.currentName = this.account.Name
            this.currentRating = this.account.Rating

            this.hasRendered = true
            let nameRow = {title: 'Name',content: this.template.querySelector('[title=Name]')}
            let ratingRow = {title: 'Rating', content: this.template.querySelector('[title=Rating]')}
            this.dispatchEvent(new CustomEvent('addrow', {detail: nameRow}))
            this.dispatchEvent(new CustomEvent('addrow', {detail: ratingRow}))
        }
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
        let currentName = event.target.innerHTML
        if(currentName != this.account.Name){
            event.target.style.backgroundColor = 'yellow'
        }else{
            event.target.style.backgroundColor = 'white'
        }
    }

    ratingChangeHandler(event){
        let currentRating = event.target.innerHTML
        if(currentRating != this.account.Rating){
            event.target.style.backgroundColor = 'yellow'
        }else{
            event.target.style.backgroundColor = 'white'
        }
    }
}