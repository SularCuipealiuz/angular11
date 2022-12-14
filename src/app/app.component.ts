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
  totalCount = 0;

  ngOnInit() {
    this.getData();
  }

  refresh(): void {
    this.todoListFiltered = this.filterData(this.todoList);
    this.onChangeFilter(this.selectedFilter);
  }

  onClickLeft(): void {
    this.currentPage = this.currentPage > 0 ? this.currentPage - 1 : this.currentPage;
    this.refresh();
  }

  onClickRight(): void {
    this.currentPage = this.currentPage + 1 > this.getCeil(this.totalCount, this.perPage) - 1 ? this.currentPage : this.currentPage + 1;
    this.refresh();
  }

  getCeil(num1, num2): number {
    return Math.ceil(num1 / num2);
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
          e.checked = e.checked ? e.checked : false;
          e.hovered = false;
          e.editing = false;
          return e;
        });

        this.refresh();
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
    let filteredList = [];
    if (target === 'Active') {
      filteredList = this.todoList.filter(e => !e.checked);
    } else if (target === 'Completed') {
      filteredList = this.todoList.filter(e => e.checked);
    } else {
      filteredList = this.todoList;
    }

    this.totalCount = filteredList.length;
    this.todoListFiltered = this.filterData(filteredList);
    this.filterLength = this.todoList.filter(e => e.checked === false).length;
  }

  onCheckItem(item: any): void {
    item.checked = !item.checked;
    item.hovered = false;
    this.onChangeFilter(this.selectedFilter);

    const response = fetch('http://localhost:3000/posts/' + item.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checked: item.checked,
      })
    });
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
      this.onChangeFilter(this.selectedFilter);
      this.isSelectAll = false;
    }, 400);
  }

  onSelectAll(): void {
    this.isSelectAll = !this.isSelectAll;
    this.todoList.forEach(e => {
      this.isSelectAll ? e.checked = true : e.checked = false;
    });
    this.onChangeFilter(this.selectedFilter);
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
