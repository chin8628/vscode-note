// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
// import { ToWebView as twv } from '../panel/message';

// import './index.scss';

// interface vscode {
//     postMessage(message: any): void;
// }

// declare function acquireVsCodeApi(): vscode;

// const vscode: vscode = acquireVsCodeApi();

// const editNote = (id: number) => () => vscode.postMessage({ command: 'edit', data: id });
// const viewDoc = (id: number) => () => {
//     vscode.postMessage({ command: 'doc', data: id });
//     vscode.postMessage({ command: 'files', data: id });
// };

// function VSNNotes(props: twv.VSNWVNote) {
//     const contents = props.contents.map(c => (
//         <div className="col">
//             <pre>{c}</pre>
//         </div>
//     ));

//     const domId = props.doc ? <a onClick={viewDoc(props.id)}>{props.id}</a> : <span>{props.id}</span>;

//     return (
//         <div className="row ">
//             <div className="col col-1">
//                 <pre>{domId}</pre>
//             </div>
//             {contents}
//             <div className="col col-1">
//                 <pre>
//                     <a onClick={editNote(props.id)}>
//                         <FontAwesomeIcon inverse icon={faPen} />
//                     </a>
//                 </pre>
//             </div>
//         </div>
//     );
// }

// function VSNCategory(props: twv.VSNWVCategory) {
//     const listnote = props.notes.map((note: twv.VSNWVNote) => (
//         <VSNNotes id={note.id} contents={note.contents} doc={note.doc} />
//     ));

//     return (
//         <div className="card bg-dark text-white">
//             <div className="card-header">{props.name}</div>
//             <div className="card-body">
//                 <div className="container">{listnote}</div>
//             </div>
//         </div>
//     );
// }

// function VNSDomain(props: twv.VSNWVDomain) {
//     const categorys = props.categorys;
//     const listCategory = categorys.map((category: twv.VSNWVCategory) => (
//         <VSNCategory name={category.name} notes={category.notes} />
//     ));

//     return (
//         <div>
//             <h1>{props.name}</h1>
//             <div>{listCategory} </div>
//         </div>
//     );
// }

// window.addEventListener('message', event => {
//     const message: twv.DomainData = event.data;
//     switch (message.command) {
//         case 'data':
//             const name = message.data.name;
//             const categorys = message.data.categorys;
//             ReactDOM.render(<VNSDomain name={name} categorys={categorys} />, document.getElementById('root'));
//             break;
//         default:
//             ReactDOM.render(<h1>Error</h1>, document.getElementById('root'));
//     }
// });

// vscode.postMessage({ command: 'ready', data: true });
// console.log('web view ready.');
