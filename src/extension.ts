import { ext, initializeExtensionVariables } from './extensionVariables';
import { ExtensionContext, ViewColumn, commands } from 'vscode';
import { ExtCmds } from './extensionCommands';

export async function activate(context: ExtensionContext) {
    console.log('vscode extension "vscode-note" is now active!');

    initializeExtensionVariables(context);

    /**
     * domain
     */
    ext.registerCommand('vscode-note.domain.create', ExtCmds.cmdHdlDomainCreate);
    ext.registerCommand('vscode-note.domain.pin', ExtCmds.cmdHdlDomainPin);
    ext.registerCommand('vscode-note.domain.move', ExtCmds.cmdHdlDomainMove);
    ext.registerCommand('vscode-note.domain.rename', ExtCmds.cmdHdlDomainRename);
    ext.registerCommand('vscode-note.notes.create', ExtCmds.cmdHdlNotesCreate);
    ext.registerCommand('vscode-note.domain.refresh', ExtCmds.cmdHdlDomainRefresh);
    /**
     * notes view
     */
    ext.registerCommand('vscode-note.category.add', ExtCmds.cmdHdlCategoryAdd);
    ext.registerCommand('vscode-note.note.files.open', ExtCmds.cmdHdlNoteFilesOpen);
    ext.registerCommand('vscode-note.note.doc.show', ExtCmds.cmdHdlNoteDocShow);
    ext.registerCommand('vscode-note.note.add', ExtCmds.cmdHdlNoteAdd);
    ext.registerCommand('vscode-note.category.edit', ExtCmds.cmdHdlCategoryEdit);
    /**
     * note
     */
    ext.registerCommand('vscode-note.note.edit.delete', ExtCmds.cmdHdlNoteEditRemove);
    ext.registerCommand('vscode-note.note.edit', ExtCmds.cmdHdlNoteEdit);
    ext.registerCommand('vscode-note.note.edit.col', ExtCmds.cmdHdlNoteEditCol);
    ext.registerCommand('vscode-note.note.edit.col.content', ExtCmds.cmdHdlNoteEditColContent);
    ext.registerCommand('vscode-note.note.edit.col.add', ExtCmds.cmdHdlNoteEditColAdd);
    ext.registerCommand('vscode-note.note.edit.col.remove', ExtCmds.cmdHdlNoteColRemove);
    ext.registerCommand('vscode-note.note.edit.openFolder', ExtCmds.cmdHdlNoteOpenFolder);
    ext.registerCommand('vscode-note.note.edit.category.rename', ExtCmds.cmdHdlNoteEditCategoryRename);
    ext.registerCommand('vscode-note.note.edit.files.create', ExtCmds.cmdHdlNoteEditFilesCreate);
    ext.registerCommand('vscode-note.note.edit.doc.create', ExtCmds.cmdHdlNoteEditDocCreate);
    ext.registerCommand('vscode-note.note.edit.doc.full', ExtCmds.cmdHdlNoteEditDocFull);
    /**
     * note files
     */
    ext.registerCommand('vscode-note.files.close', ExtCmds.cmdHdlFilesClose);
    ext.registerCommand('vscode-note.files.edit.open', ExtCmds.cmdHdlFilesEditOpen);
    ext.registerCommand('vscode-note.files.openTerminal', ExtCmds.cmdHdlFilesOpenTerminal);
    ext.registerCommand('vscode-note.files.refresh', ExtCmds.cmdHdlFilesRefresh);
    /**
     *  extension
     */
    // if (checkFirst) {
    //     if ((await window.showInformationMessage('vscode-note installed.', 'Open it.', 'Not now.')) === 'Open it.') {
    //         commands.executeCommand('workbench.view.extension.vsnote-explorer');
    //         ext.notesPanelView.parseDomain(['powershell', 'install']).showNotesPlanView();
    //     }
    // }

    ext.registerCommand('editExplorer.openFileResource', async (resource: any) => {
        await commands.executeCommand('vscode.open', resource, ViewColumn.Two);
    });
}

export function deactivate() { }