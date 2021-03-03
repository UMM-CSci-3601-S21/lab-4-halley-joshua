import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo } from './todo';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  todo: Todo;

  addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner cannot be more than 50 characters long'},
    ],

    status: [
      {type: 'required', message: 'Status is required'},
      {type: 'pattern', message: 'Status must be complete, incomplete or true, false.'},
    ],

    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: 'Body must be at least 2 characters long'},
    ]
  };

  constructor(private fb: FormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) {
  }

  createForms() {

    this.addTodoForm = this.fb.group({

      owner: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ])),

     status: new FormControl('', Validators.compose([
        Validators.required,

        Validators.pattern('^(complete|incomplete|Complete|Incomplete|true|false)$')
      ])),

       category: new FormControl(),

      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2)
      ])),

    });

  }

  ngOnInit() {
    this.createForms();
  }


  submitForm() {
    if (this.addTodoForm.value.status === 'Complete' || this.addTodoForm.value.status === 'complete'){
      this.addTodoForm.value.status = true;
    }
    else if (this.addTodoForm.value.status === 'Incomplete' || this.addTodoForm.value.status === 'incomplete'){
      this.addTodoForm.value.status = false;
    }
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open('Added Todo ' + this.addTodoForm.value.owner, null, {
        duration: 2000,
      });
      this.router.navigate(['/todos/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the todo', 'OK', {
        duration: 5000,
      });
    });
  }

}
