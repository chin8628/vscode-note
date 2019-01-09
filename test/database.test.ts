import * as fs from "fs";
import * as path from "path";

import rimraf = require("rimraf");

import * as db from '../src/database';
import { TestFileStructure } from "./lib";

let vscodeDB: db.VSNDatabase | undefined = undefined;

const testDataRootPath = "./";
const testDataPath = path.join(testDataRootPath, ".vscode-note");
const testNotesSeq = path.join(testDataPath, "notes.seq");

const testDataDomains: { [domain: string]: any } = {
    powershell: {
        install: {},
        ".notes": [1, 2, 3]
    },
    oracle: {
        ".notes": []
    }
};

const testDataNote: db.VSNNote = { id: 1, contents: ["test", "select * from dual;"], meta: { category: "test" } };

const tdl: TestFileStructure[] = [
    { path: '', kind: "d" },
    { path: 'domains.json', kind: "f", content: JSON.stringify(testDataDomains) },
    { path: 'notes', kind: "d" },
    { path: `notes/${testDataNote.id}`, kind: "d" },
    { path: `notes/${testDataNote.id}/1.txt`, kind: "f", content: testDataNote.contents[0] },
    { path: `notes/${testDataNote.id}/2.sql`, kind: "f", content: testDataNote.contents[1] },
    { path: `notes/${testDataNote.id}/.n.json`, kind: "f", content: JSON.stringify({ category: testDataNote.meta.category }) },
    { path: `notes.seq`, kind: "f", content: '3' }
];

function createTestFileAndDirectory(tdl: TestFileStructure[]) {
    for (const f of tdl) {
        const p = path.join(testDataRootPath, ".vscode-note", f.path);
        switch (f.kind) {
            case "d": fs.mkdirSync(p); break;
            case "f": fs.writeFileSync(p, f.content, { encoding: "utf-8" }); break;
        }
    }
}

function removeTestData() {
    rimraf.sync(testDataPath);
}

beforeAll(() => {
    createTestFileAndDirectory(tdl);
    vscodeDB = new db.VSNDatabase(testDataRootPath);
});

afterAll(() => removeTestData());

test('true', () => {
    expect(vscodeDB!.selectDomain("/powershell").childs.length >= 1 ? true : false).toBe(true);
});

test('select domain, dpath: /', () => {
    const child: string[] = Object.keys(testDataDomains);
    // const child2: string[] = Object.keys(testDataDomains["oracle"]);
    const expectData: db.VSNDomain =
        { childs: child, notes: testDataDomains[".notes"] };
    expect(vscodeDB!.selectDomain("/")).toEqual(expectData);
});

test('select domain childs length', () => {
    expect(vscodeDB!.selectDomain("/oracle").childs.length >= 1 ? true : false).toBe(false);
});

// test('dqual powershell notes', () => {
//     expect(vscodeDB!.readNotesIdOfDomain('/powershell')).toEqual(testDataDomains.powershell[".notes"]);
// });

test('test select note', () => {
    expect(vscodeDB!.selectNote(1)).toEqual(testDataNote);
});

test('inc seq', () => {
    const id = vscodeDB!.incNoteSeq();
    const noteseq = Number(fs.readFileSync(testNotesSeq, { encoding: 'utf-8' }));
    expect(id).toEqual(noteseq);
});

test('select seq', () => {
    const id = vscodeDB!.selectNoteSeq();
    const noteseq = Number(fs.readFileSync(testNotesSeq, { encoding: 'utf-8' }));
    expect(id).toEqual(noteseq);
});

test('create note', () => {
    vscodeDB!.createNote('/powershell');
    const noteseq = Number(fs.readFileSync(testNotesSeq, { encoding: 'utf-8' }));
    expect(fs.existsSync(path.join(testDataPath, "notes", noteseq.toString()))).toEqual(true);
});

// test('fusion notes', () => {
//     const cname = testDataNote.category;
//     const nid: number = testDataNote.id;
//     const ncontents: string[] = testDataNote.contents;
//     expect(vscodeDB!.fusionNote([testDataNote]))
//         .toEqual([{ name: cname, notes: [{ id: nid, contents: ncontents }] }]);
// });