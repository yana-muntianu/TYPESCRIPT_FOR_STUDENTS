interface IObserver {
  next(value: object): void;
  error(error: Error): void;
  complete(): void;
}

class Observer implements IObserver {
  private isUnsubscribed: boolean = false;
  public _unsubscribe: any;

  constructor(private handlers: IObserver) {}

  next(value: object): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }
      this.unsubscribe();
    }
  }

  unsubscribe() : void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

interface IObservable {
  subscribe(obs: IObserver): void;
}

class Observable implements IObservable {
  private _subscribe: (obj: Observer) => {};
  
  constructor(subscribe: (obs: Observer) => {}) {
    this._subscribe = subscribe;
  }

  static from(values: object[]): Observable {
    return new Observable((observer: Observer) => {
      values.forEach((value: object) => observer.next(value));

      observer.complete();

      return () : void  => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: IObserver): { unsubscribe(): void } {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD = "POST";
const HTTP_GET_METHOD = "GET";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
}

interface MockRequest {
  method: string;
  host: string;
  path: string;
  body?: User;
  params: { id?: string };
}

const userMock : User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock : MockRequest[] = [
  {
    method: HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: Request): object => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};
const handleError = (error: Error): object => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
