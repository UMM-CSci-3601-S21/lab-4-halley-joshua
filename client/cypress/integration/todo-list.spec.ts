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
      cy.wrap(e).find('.todo-list-status').should('have.text', 'true');
    });
  });

  it('Should type something in the owner filter and check that it returned correct elements', () => {
    // Filter for todo 'Blanche'
    cy.get('#todo-owner-input').type('Blanche');

    // Some of the todos should be listed
    page.getTodoListItems().should('exist');

    // All of the todo list items that show should have the status we are looking for
    page.getTodoListItems().each(e => {
      cy.wrap(e).find('.todo-list-owner').should('have.text', 'Blanche');
    });
  });
});
