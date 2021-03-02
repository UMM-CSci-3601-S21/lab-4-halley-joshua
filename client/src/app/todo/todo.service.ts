import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';

@Injectable()
export class TodoService {
  readonly todoUrl: string = environment.apiUrl + 'todos';

  constructor(private httpClient: HttpClient) {
  }

  getTodos(filters?: { status?: string }): Observable<Todo[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.status && filters.status.toString().toLocaleLowerCase() === 'complete') {
        filters.status = 'true';
        httpParams = httpParams.set('status', filters.status);
      }
      if (filters.status && filters.status.toString().toLocaleLowerCase() === 'incomplete') {
        filters.status = 'false';
        httpParams = httpParams.set('status', filters.status);
      }
  }
    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  getTodoById(id: string): Observable<Todo> {
    return this.httpClient.get<Todo>(this.todoUrl + '/' + id);
  }

  filterTodos(todos: Todo[], filters: { category?: string; owner?: string; keyWord?: string; limit?: number }): Todo[] {

    let filteredTodos = todos;

    // Filter by owner
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }

    // Filter by category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => todo.category.toLowerCase().indexOf(filters.category) !== -1);
    }

    // Filter by keyWord (body)
    if (filters.keyWord){
      filters.keyWord = filters.keyWord.toLowerCase();

      filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.keyWord) !== -1);
    }

    // Limit todos
    if (filters.limit){
    filteredTodos = filteredTodos.slice(0,filters.limit);
    }
    return filteredTodos;
  }


}
