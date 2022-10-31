import {Component} from '@angular/core';
import {faChevronDown, faTimes, faAngleRight, faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {faCircle, faCircleCheck} from '@fortawesome/free-regular-svg-icons';
import {timeout} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  faTimes = faTimes;
  faCircleCheck = faCircleCheck;
  faCircle = faCircle;
  faChevronDown = faChevronDown;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;

  inputValue = '';
  todoList = [];
  todoListFiltered = [];
  isSelectAll = false;
  selectedFilter = 'All';
  filterLength = 0;
  windowsWidth = '500';
  currentPage = 0;
  perPage = 5;

  ngOnInit() {
    this.getData();
  }

  onClickLeft(): void {
    this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.currentPage;
    this.todoListFiltered = this.filterData(this.todoList);
  }

  onClickRight(): void {
    this.currentPage = this.currentPage + 1 > (this.todoList.length / this.perPage) ? this.currentPage : this.currentPage + 1;
    this.todoListFiltered = this.filterData(this.todoList);
  }

  filterData(list: any[]): any[] {
    const array = [];
    const dataStart = (this.perPage * this.currentPage);
    // tslint:disable-next-line:max-line-length
    const dataEnd = this.perPage * (1 + this.currentPage) > list.length ? list.length : this.perPage * (1 + this.currentPage);

    for (let i = dataStart; i < dataEnd; i++) {
      array.push(list[i]);
    }

    return array;
  }

  getData(): void {
    fetch('http://localhost:3000/posts')
      .then(res => res.json())
      .then(data => {
        this.todoList = data.map(e => {
          e.checked = false;
          e.hovered = false;
          e.editing = false;
          return e;
        });

        this.todoListFiltered = this.filterData(this.todoList);
        this.filterLength = this.todoList.filter(e => e.checked === false).length;
      });
  }

  onEnter(event: any): void {
    if (event.key === 'Enter') {
      this.postData(this.inputValue).then(() => this.inputValue = '');
    }
  }

  onInput(event: any): void {
    this.inputValue = event.target.value;
  }

  async onEdit(item: any, event: any): Promise<any> {
    item.editing = false;
    const response = await fetch('http://localhost:3000/posts/' + item.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: event.target.value,
      })
    });

    response.json().then(() => this.getData());
  }

  onChangeFilter(target: string): void {
    this.selectedFilter = target;
    if (target === 'Active') {
      this.todoListFiltered = this.todoList.filter(e => !e.checked);
    } else if (target === 'Completed') {
      this.todoListFiltered = this.todoList.filter(e => e.checked);
    } else {
      this.todoListFiltered = this.todoList;
    }

    this.todoListFiltered = this.filterData(this.todoListFiltered);
  }

  onCheckItem(item: any): void {
    item.checked = !item.checked;
    this.filterLength = this.todoList.filter(e => e.checked === false).length;
  }

  async onDestroy(item: any): Promise<any> {
    const response = await fetch('http://localhost:3000/posts/' + item.id, {
      method: 'DELETE',
    });

    response.json().then(() => this.getData());
  }

  onMultiDestroy(): void {
    this.todoList.forEach(async e => {
      if (e.checked) {
        await fetch('http://localhost:3000/posts/' + e.id, {
          method: 'DELETE',
        });
      }
    });
    setTimeout(() => {
      this.getData();
      this.isSelectAll = false;
    }, 400);
  }

  onSelectAll(): void {
    this.isSelectAll = !this.isSelectAll;
    this.todoList.forEach(e => {
      this.isSelectAll ? e.checked = true : e.checked = false;
    });
  }

  async postData(value: string): Promise<any> {
    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: value
      })
    });

    response.json().then(() => this.getData());
  }
}
