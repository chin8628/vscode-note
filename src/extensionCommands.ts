import { ext } from './extensionVariables';
import { commands, Uri, window } from 'vscode';
import { vpath, vfs } from './helper';
import { basename } from 'path';
import { noteDocHtmlPanel } from './panel/noteDocHtmlPanel';
import { DomainNode } from './explorer/domainExplorer';
import { ctxFilesExplorer } from './constants';
import { NoteDatabase } from './database';

export namespace ExtCmds {
    export async function cmdHdlNoteEditColAdd(id: string) {
        const cn = ext.dbFS.createNoteCol(id);
        await commands.executeCommand('editExplorer.openFileResource', Uri.file(ext.dbFS.getNoteContentFile(id, cn)));
        // ext.editProvider.refresh();
    }
    export async function cmdHdlNoteEditCol(id: string, cn: string) {
        const rst = await window.showQuickPick(['add', '------', 'delete']);
        if (!rst) return;
        ext.activeNote.id = id;
        if (rst === 'add') {
            await cmdHdlNoteEditColAdd(id);
        } else if (rst === 'delete') {
            await cmdHdlNoteColRemove(id, cn);
        } else {
        }
        ext.notesPanelView.parseDomain().showNotesPlanView();
    }
    export async function cmdHdlNotesCreate(dn: DomainNode) {
        ext.dbFS.dch.createNotes(vpath.splitPath(dn));
        ext.domainProvider.refresh(dn);
        await cmdHdlDomainPin(dn);
    }
    export async function cmdHdlNoteEdit(nId: string, category: string) {
        const picks = [];
        ext.activeNote.id = nId;
        ext.activeNote.category = category;
        picks.push(ext.dbFS.selectDocExist(nId) ? 'edit doc' : 'create doc');
        ext.dbFS.selectFilesExist(nId) || picks.push('create files');
        picks.push('category rename');
        picks.push('trash');
        picks.push('open note folder');
        const pick = await window.showQuickPick(picks);
        if (!pick) return;
        switch (pick) {
            case 'create doc':
                await cmdHdlNoteEditDocCreate(nId);
                break;
            case 'edit doc':
                await cmdHdlNoteEditDocFull(nId);
                break;
            case 'create files':
                await cmdHdlNoteEditFilesCreate(nId);
                break;
            case 'category rename':
                // await cmdHdlNoteEditCategoryRename(nId);
                break;
            // case 'trash': break;
            case 'open note folder':
                await cmdHdlNoteOpenFolder(nId);
                break;
        }
    }
    export async function cmdHdlDomainCreate(dn?: DomainNode) {
        const dpath = dn ? vpath.splitPath(dn) : [];
        const name: string | undefined = await window.showInputBox();
        if (!name) return;
        ext.dbFS.dch.createDomain(dpath, name);
        ext.domainProvider.refresh(dn);
        !dn || ext.domainTreeView.reveal(dn, { expand: true });
    }
    export async function cmdHdlDomainPin(dn: DomainNode) {
        ext.activeNote.domainNode = dn;
        ext.notesPanelView.parseDomain(vpath.splitPath(dn)).showNotesPlanView();
        await ext.setContext(ctxFilesExplorer, false);
    }
    export async function cmdHdlNoteColRemove(id: string, cn: string) {
        //cn : column number
        ext.dbFS.deleteNoteCol(id, Number(cn));
        // ext.editProvider.refresh();
    }
    export async function cmdHdlNoteEditRemove() {
        const sqp = await window.showQuickPick(['Yes', 'No']);
        if (!sqp || sqp === 'No') return;
        ext.dbFS.dch.removeNotes(vpath.splitPath(ext.activeNote.domainNode!), ext.activeNote.id!);
        // ext.dbFS.removeNotes(ext.activeNote.dpath, ext.activeNote.id!);
        ext.notesPanelView.parseDomain().showNotesPlanView();
    }
    export async function cmdHdlCategoryAdd() {
        const cname = await window.showInputBox({ value: 'default' });
        if (!cname) return;
        await cmdHdlNoteAdd(cname, false);
        ext.notesPanelView
            .parseDomain()
            .addCategory(cname)
            .showNotesPlanView();
    }
    export async function cmdHdlNoteAdd(category: string, editFirst: boolean = true) {
        const nid: string = ext.dbFS.createNode(vpath.splitPath(ext.activeNote.domainNode!), category);
        vfs.writeFileSync(ext.dbFS.getNoteContentFile(nid, '1'));
        if (editFirst) {
            await commands.executeCommand('editExplorer.openFileResource', Uri.file(ext.dbFS.getNoteContentFile(nid, '1')));
        }
        ext.domainProvider.refresh(ext.activeNote.domainNode);
    }
    export async function cmdHdlNoteEditFilesCreate(id: string) {
        ext.dbFS.createNoteFiles(id);
        ext.notesPanelView.parseDomain().showNotesPlanView();
        await cmdHdlNoteFilesOpen(id);
    }
    export async function cmdHdlNoteEditFilesClose() {
        await ext.setContext(ctxFilesExplorer, true);
    }
    export async function cmdHdlNoteEditDocCreate(id: string) {
        ext.dbFS.createNoteDoc(id);
        await commands.executeCommand('editExplorer.openFileResource', Uri.file(ext.dbFS.getNoteDocIndexFile(id, 'README.md')));
    }
    export async function cmdHdlDomainMove(dn: DomainNode) {
        const orgDpath = vpath.splitPath(dn);
        const newDpathString: string | undefined = await window.showInputBox({ value: orgDpath.join('/') });
        if (!newDpathString || orgDpath.join('/') === newDpathString) return;
        const newDpath = vpath.splitPath(newDpathString);
        ExtCmdsFuns.resetDomain(orgDpath, newDpath);
        for (let i = 0; i <= orgDpath.length; i++) {
            if (orgDpath[i] !== newDpath[i]) {
                const dpath = newDpath.slice(0, i);
                await ext.domainProvider.refresh(dpath.join('/'));
                await ext.domainTreeView.reveal(newDpath.join('/'));
                break;
            }
        }
        ext.activeNote.dpath = newDpath;
    }
    export async function cmdHdlDomainRename(dn: DomainNode) {
        const orgDpath = vpath.splitPath(dn);
        const orgName = orgDpath[orgDpath.length - 1];
        const newName: string | undefined = await window.showInputBox({ value: orgName });
        if (!newName || orgName == newName) return;
        const newDpath = orgDpath.slice();
        newDpath[newDpath.length - 1] = newName;
        ExtCmdsFuns.resetDomain(orgDpath, newDpath);
        ext.domainProvider.refresh(orgDpath.slice(0, orgDpath.length - 1).join('/'));
    }
    export async function cmdHdlNoteOpenFolder(id: string) {
        await commands.executeCommand('vscode.openFolder', Uri.file(ext.dbFS.getNotePath(id)), true);
    }
    export async function cmdHdlNoteEditCategoryRename() {
        const newCname = await window.showInputBox({ value: ext.activeNote.category });
        if (!newCname) return;
    }
    export async function cmdHdlNoteDocShow(nId: string) {
        const readmeFile = ext.dbFS.selectDocIndexFile(nId);
        if (basename(readmeFile).split('.')[1] === 'md') {
            const uri = Uri.file(readmeFile);
            await commands.executeCommand('markdown.showPreviewToSide', uri);
        } else {
            noteDocHtmlPanel(readmeFile);
        }
    }
    export async function cmdHdlNoteFilesOpen(nId: string) {
        ext.activeNote.id = nId;
        ext.filesProvider.refresh();
        await ext.setContext(ctxFilesExplorer, true);
    }
    export async function cmdHdlFilesClose() {
        await ext.setContext(ctxFilesExplorer, false);
    }
    export async function cmdHdlFilesEditOpen() {
        await commands.executeCommand('vscode.openFolder', Uri.file(ext.dbFS.getNoteFilesPath(ext.activeNote.id)), true);
    }
    export async function cmdHdlFilesRefresh() {
        ext.filesProvider.refresh();
    }
    export async function cmdHdlFilesOpenTerminal() {
        const nId = ext.activeNote.id;
        const dpath = vpath.splitPath(ext.activeNote.domainNode!);
        const filePath = ext.dbFS.getNoteFilesPath(nId);
        const fileTerminal = window.createTerminal({ name: `${dpath} - ${nId}`, cwd: filePath });
        fileTerminal.show(true);
    }
    export async function cmdHdlDomainRefresh() {
        ext.dbFS = new NoteDatabase(ext.notesPath);
        ext.domainProvider.refresh();
    }
    export async function cmdHdlNoteEditDocFull(id: string) {
        await commands.executeCommand('vscode.openFolder', Uri.file(ext.dbFS.getNoteDocPath(id)), true);
    }
    // export async function cmdHdlCategoryToDomain(category: string) {
    //     const dpath = vpath.splitPath(ext.activeNote.domainNode!);
    //     const newDomainName = 'category';
    //     const newCategory = 'xx';
    // }
}

namespace ExtCmdsFuns {
    // export async function renameCategory(
    //     dpath: string,
    //     nId: string,
    //     orgCategory: string,
    //     newCategory: string
    // ) { }

    export function resetDomain(orgDpath: string[], newDpath: string[]) {
        ext.dbFS.updateNotesPath(orgDpath, newDpath, true);
        const notes = ext.dbFS.dch.selectAllNotesUnderDomain(orgDpath);
        ext.dbFS.dch.deleteDomain(orgDpath);
        ext.dbFS.cacheValidNotes(...notes);
        ext.notesPanelView.parseDomain(newDpath).showNotesPlanView();
    }
}
