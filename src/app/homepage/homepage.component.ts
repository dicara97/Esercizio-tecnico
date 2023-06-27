import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { AuthenticationService } from '../services/authentication.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DocumentService } from '../services/document.service';
import { Document } from '../models/document.model';
interface optionalValues {
  name: string;
  type: string;
  isRequired: boolean;
  id: number
}

const DEFAULT = { title: '', optionalValues: [] };
const resetToDefault = (state: any) => Object.assign(state, DEFAULT);
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
  loading = false;
  user!: User;
  documentForm!: FormGroup;
  optionalFieldsForm!: FormGroup;
  openStatus = false;
  openedSelect!: any;
  canAdd: boolean = false;
  isEditing: boolean = false;
  isIncomplete = true;
  titleAdded: boolean = false;
  optionalValueAdded: boolean = false;
  documentSubmitted: {
    title: string;
    optionalValues: optionalValues[];
  };
  isSuccess: boolean = false
  selectedDocument!: any

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private documentService: DocumentService
  ) {
/* Initializing an object `documentSubmitted` with two properties `title` and `optionalValues` both set
to empty values. This object is used to store the values submitted by the user in the form. */
    this.documentSubmitted = {
      title: '',
      optionalValues: [],
    };
  }

/**
 * The ngOnInit function initializes variables and creates forms.
 */
  ngOnInit() {
    this.loading = false;
    this.authenticationService.user.subscribe((res) => (this.user = res));
    this.createOptionFieldsForm();
    this.createForm();
  }

/**
 * The function creates a form using the Angular FormBuilder with a required title field and an
 * optionalValues group.
 */

getRandomId() {
  return Math.floor((Math.random()*100)+1);
}
  createForm() {
    this.documentForm = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ],
      ],
      optionalValues: this.formBuilder.group({}),
    });
  }

/**
 * This function creates a form with an array of optional value groups using the Angular FormBuilder.
 */
  createOptionFieldsForm() {
    this.optionalFieldsForm = this.formBuilder.group({
      optionalValues: this.formBuilder.array(
        [this.createOptionalValueGroup()],
        Validators.required
      ),
    });
  }

/**
 * This function adds a new optional value form group to a form array.
 */
  addOptionaValueFormGroup() {
    this.canAdd = false;
    this.optionalValueAdded = false;
    const values = this.optionalFieldsForm.get('optionalValues') as FormArray;
    values.push(this.createOptionalValueGroup());
  }

/**
 * This function adds optional values into a document form and updates the documentSubmitted object
 * accordingly.
 * @param {string} type - a string that determines the type of value being added into the document
 * form. It can be either 'title' or 'optional'.
 * @param {number} [i] - i is an optional parameter of type number. It is used in the function to
 * access a specific optional value from an array of optional values. If i is provided, the function
 * will push the corresponding optional value into the documentSubmitted object. If i is not provided,
 * the function will not push any optional
 */
  addOptionalValueIntoDocumentForm(type: string, i?: number) {
    if (type == 'optional') this.canAdd = !this.canAdd;
    switch (type) {
      case 'title':
        this.documentSubmitted.title = this.documentForm.value.title;
        if (this.documentSubmitted.title != '') this.titleAdded = true;
        break;
      case 'optional':
        this.optionalValueAdded = true;
        if (i || i == 0)
          this.documentSubmitted.optionalValues.push(
            this.optionalValues.value[i]
          );
        break;
      default:
    }
  }
/**
 * This function returns a FormArray of optional values from a FormGroup.
 * @returns A FormArray object is being returned, which represents a collection of FormControl objects
 * that can be used to manage a group of form controls.
 */
  get optionalValues() {
    return <FormArray>this.optionalFieldsForm.get('optionalValues');
  }

/**
 * This function removes an optional value from a form array and updates the corresponding data in the
 * documentSubmitted object.
 * @param {number} i - a number representing the index of the optional value to be removed from the
 * form array and the documentSubmitted array.
 */
  removeOptionalValue(i: number) {
    const values = this.optionalFieldsForm.get('optionalValues') as FormArray;
    if (values.length > 1) {
      values.removeAt(i);
    } else {
      values.reset();
    }
    this.documentSubmitted.optionalValues.splice(i, 1);
    console.log(this.documentSubmitted.optionalValues.length)
    console.log(i, this.optionalFieldsForm.value.optionalValues, this.optionalFieldsForm.value.optionalValues.length )
    if (this.optionalFieldsForm.value.optionalValues.length === 1)
      this.canAdd = false;
    if (
      this.optionalFieldsForm.value.optionalValues.length ===
      this.documentSubmitted.optionalValues.length
    )
      this.optionalFieldsForm.value.optionalValues[
        this.optionalFieldsForm.value.optionalValues.length - 1
      ].name === ''
        ? (this.canAdd = false)
        : (this.canAdd = true);

    if(this.optionalFieldsForm.value.optionalValues[
      this.optionalFieldsForm.value.optionalValues.length - 1
    ].name)
    this.canAdd = true
    if(i === 0)
    this.canAdd = false
 
  }

/**
 * This function resets various values and forms based on the type of reset requested.
 * @param {string} type - a string that determines which case to execute in the switch statement.
 * @param {number} [i] - an optional parameter of type number, used in the case 'optional' to specify
 * the index of the optional value to be removed from the form array. If not provided, all optional
 * values will be removed.
 */
  resetOptionalValue(type: string, i?: number) {
    switch (type) {
      case 'title':
        this.titleAdded = false;
        this.documentForm.reset();
        this.documentSubmitted.title = '';
        break;
      case 'optional':
        this.optionalValueAdded = false;
        if (i || i == 0) {
          this.optionalValues.removeAt(i);
          this.addOptionaValueFormGroup();
        }
        break;
      case 'all':
        this.titleAdded = false;
        this.optionalValueAdded = false;
        this.documentSubmitted.title = '';
        this.documentSubmitted.optionalValues.length = 0;
        this.documentForm.reset();
        this.optionalFieldsForm.reset();
        this.optionalValues.reset();
        this.createOptionFieldsForm();
        this.createForm();
        this.canAdd = false;
        // if(this.optionalValues.value.length === 0)
        // this.addOptionaValueFormGroup()
        break;
    }
  }

/**
 * This function creates a FormGroup with three form controls, including one optional control.
 * @returns A FormGroup object is being returned.
 */
  createOptionalValueGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      isRequired: new FormControl(false),
      id: new FormControl(this.getRandomId())
    });
  }

/**
 * The function checks if a title and an optional value have been added and returns a boolean value
 * accordingly.
 * @returns The `checkValues()` function returns a boolean value. It returns `false` if either
 * `titleAdded` or `optionalValueAdded` is not true, and it returns `true` if both `titleAdded` and
 * `optionalValueAdded` are true.
 */
  checkValues() {
    if (!this.titleAdded) return false;
    else if (!this.optionalValueAdded) return false;
    else return true;
  }



/**
 * The onSubmit function adds a document value and then adds a document to the document service,
 * logging the data and setting a success flag if successful.
 */
  onSubmit() {
    console.log(this.selectedDocument)
    this.documentService.addValue(this.documentSubmitted);
    this.documentService
      .addDocument(this.documentSubmitted).subscribe({
        next: (data) => {
          this.documentService.addValue(data)
          this.isSuccess = true
          this.resetOptionalValue('all')
          setTimeout(() => {
            this.isSuccess = false
          }, 2000);
        },
        error: (err) => {
          console.log(err)
        },
      });
  }

  editValue(documentToEdit: optionalValues){
    this.canAdd = false
    this.isEditing = true
    this.selectedDocument = documentToEdit
  }

  changeSelectedValue(document: any){
    this.isEditing = false
    this.canAdd = true
    this.documentSubmitted.optionalValues.forEach((res, index) => {
      if(res.id === this.selectedDocument.id) 
      this.documentSubmitted.optionalValues[index] = document
    })
    this.selectedDocument = undefined
  }
}
