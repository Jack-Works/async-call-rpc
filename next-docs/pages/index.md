# async-call-rpc

To be filled...
```ts twoslash
// @errors: 2540
interface Todo {
  title: string
}

const todo: Readonly<Todo> = {
  title: 'Delete inactive users'.toUpperCase()
  //  ^?
}

todo.title = 'Hello'

Number.parseInt('123', 10)
//      ^|
```
