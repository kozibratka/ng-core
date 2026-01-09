export class ElementHelper {

  public static getCursorPosition(): number | null {
    const selection = window.getSelection();
    if (selection!.rangeCount > 0) {
      const range = selection!.getRangeAt(0);
       // Cursor position
      return range.startOffset;
    } else {
      return null;
    }
  }

  static getInnerNodeFromClickPosition(event: MouseEvent): Node | null {
    let range;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(event.clientX, event.clientY);
    }
    else if ((document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(event.clientX, event.clientY);
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    }
    if (range) {
      return range.startContainer;
    }

    return null;
  }
}
