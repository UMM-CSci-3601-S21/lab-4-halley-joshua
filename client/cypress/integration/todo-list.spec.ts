import { TodoListPage } from '../support/todo-list.po';

const page = new TodoListPage();

describe('Todo list', () => {

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });


  it('Should select a status and check that it returned correct elements', () => {
    // Filter for status 'complete'
    page.selectStatus('complete');

    // Some of the todos should be listed
    page.getTodoListItems().should('exist');

    // All of the todo list items that show should have the status we are looking for
    page.getTodoListItems().each(e => {
      cy.wrap(e).find('.todo-list-status').should('contain', 'complete');
    });
  });

  it('Should type something in the owner filter and check that it returned correct elements', () => {
    // Filter for todo 'Blanche'
    cy.get('#todo-owner-input').type('Blanche');

    // Some of the todos should be listed
    page.getTodoListItems().should('exist');

    // All of the todo list items that show should have the status we are looking for
    page.getTodoListItems().each(e => {
      cy.wrap(e).find('.todo-list-owner').should('contain', 'Blanche');
    });
  });

  it('Should type something in the category filter and check that it returned the correct elements', () => {
    // Filter for homework todos
    cy.get('#todo-category-input').type('homework');

    page.getTodoListItems().should('exist');

    // Confirm they all have homework category
    page.getTodoListItems().each(e => {
      cy.wrap(e).find('.todo-list-category').should('contain', 'homework');
    });
  });

  it('Should type something in key word filter', () => {
    // Filter by qui
    cy.get('#todo-keyWord-input').type('qui');

    page.getTodoListItems().should('exist');

    // Confirm bodies contain qui
    page.getTodoListItems().each(e => {
      cy.wrap(e).get('.todo-list-body').contains('qui');
    });
  });

  it('Should type a number in the limit filter', () => {
    // Limit to 5 todos
    cy.get('#todo-limit-input').type('5');

    page.getTodoListItems().should('exist');

    // Confirm there are 5 todos showing
    page.getTodoListItems().should('have.length', 5);
  });

  it('Should click add todo and go to the right URL', () => {
    // Click on the button for adding a new user
    page.addTodoButton().click();

    // The URL should end with '/users/new'
    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });
});
