import { Todo } from 'src/app/todo/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD TODO button should be disabled until all the necessary fields
    // are filled. Once the last field is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('status').type('true');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('groceries');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('Blah Blah Blah');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type('This is a very long owner that goes beyond the 50 character limit').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=statusError]').should('not.exist');
    // Just clicking the status field without entering anything should cause an error message
    page.getFormField('status').click().blur();
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    // Some more tests for various invalid status inputs
    page.getFormField('status').clear().type('asd').blur();
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    // Entering a valid status should remove the error.
    page.getFormField('status').clear().type('true').blur();
    cy.get('[data-test=statusError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]').should('not.exist');
    // Just clicking the category field without entering anything should cause an error message
    page.getFormField('category').click().blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
     // Some more tests for various invalid category inputs
     page.getFormField('category').type('J').blur();
     cy.get('[data-test=categoryError]').should('exist').and('be.visible');
     page.getFormField('category').clear().type('This is a very long category that goes beyond the 50 character limit').blur();
     cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('category').clear().type('homework').blur();
    cy.get('[data-test=categoryError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the body field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
     // Some more tests for various invalid category inputs
     page.getFormField('body').type('J').blur();
     cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('body').clear().type('Blah Blah Blah 1 2 3').blur();
    cy.get('[data-test=bodyError]').should('not.exist');

  });

  describe('Adding a new todo', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        status: true,
        category: 'Test Category',
        body: 'Blah blah blah',
      };

      page.addTodo(todo);

      // New URL should end in the 24 hex character Mongo ID of the newly added todo
      cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

      // The new todo should have all the same attributes as we entered
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-staus').should('have.text', todo.status);
      cy.get('.todo-card-category').should('have.text', todo.category);
      cy.get('.todo-card-body').should('have.text', todo.body);
      // We should see the confirmation message at the bottom of the screen
      cy.get('.mat-simple-snackbar').should('contain', `Added Todo ${todo.owner}`);
    });

    it('Should fail with no category', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        status: true,
        category: null, //null so no value will be entered, it should fail
        body: 'Blah blah blah',
      };

      page.addTodo(todo);

      // We should get an error message
      cy.get('.mat-simple-snackbar').should('contain', `Failed to add the todo`);

      // We should have stayed on the new todopage
      cy.url()
        .should('not.match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('match', /\/todos\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('status').should('have.value', todo.status);
      page.getFormField('body').should('have.value', todo.body);
    });
  });

});
