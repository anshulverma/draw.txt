// Artboard for drawing
// ====================

// This is where you do your drawing...
Canvas = new Class({

  Implements: Events,

  elem: null,

  // Our list of DisplayObjects
  displayList: [],

  // Our matrix of text characters making up our display
  characterGrid: [],

  // Here we store our display as a string
  txt: '',

  width: null,

  height: null,

  // Store the currently selected DisplayObject
  selected: null,

  // Constructor
  initialize: function(selector, w, h) {
    this.elem = $$(selector);
    this.width = w;
    this.height = h;
  },

  // Initialize our display matrix
  initMatrix: function(w, h) {
    this.characterGrid = new CharacterGrid(w, h, Utilities.blankChar);
  },

  // Manage the currently selected DisplayObject
  setSelected: function(val) { this.selected = val; },
  getSelected: function() { return this.selected; },

  getIndexOfSelected: function() {
    var i = null;
    if(this.selected) {
      i = this.getIndexOfChild(this.selected);
    }
    return i;
  },

  // Draw our display list.
  // Here we turn our DisplayObjects into text, and merge the text into
  // the final array of characters to display.
  draw: function(silent) {

    silent = silent || false;

    // Init our matrix
    this.initMatrix(this.width, this.height);

    // Turn the display list into a single array of characters
    Array.each(this.displayList, this.drawDisplayListItem, this);

    // Insert into DOM
    this.txt = this.characterGrid.toString();
    this.elem.set('html', this.txt);

    if(!silent) {
      this.fireEvent('canvasRefresh', this);
    }

  },

  // Given a DisplayObject, turn it into a text matrix.
  drawDisplayListItem: function(item, index, object) {

    var char = item.char,
        xOff = item.getX(),
        yOff = item.getY(),
        a = item.draw(),
        m = this.characterGrid.getArray();

    Array.each(a, function(column, columnIndex, object) {
      Array.each(column, function(row, rowIndex, object) {
        try {
          if(item === this.selected) {
            row = '<span class="selected">' + row + '</span>';
          }
          else {
            row = '<span>' + row + '</span>';
          }
          m[Number(yOff) + columnIndex][Number(xOff) + rowIndex] = row;
        }
        catch (e) {
          // TODO: handle exception
          console.log(e);
        }

      }, this);
    }, this);

  },

  hitTest: function(pt) {
    var hit = false,
        i = 0,
        max = this.displayList.length-1;

    for(var i = max; i >= 0; i-- ) {
      if(this.displayList[i].hitTest(pt)) {
        hit = this.displayList[i];
        break;
      }
    }

    return hit;
  },

  // Display List Management
  // -----------------------

  addChild: function(child) {
    this.displayList.push(child);
  },

  addChildAt: function(child, index) {

    // Break the array into the left and right pieces.
    var left = this.displayList.slice(0, index),
        right = this.displayList.slice(index);

    // Merge the left and right arrays with the new child in the middle.
    this.displayList = [].merge(left, [child], right);
  },

  removeChild: function(child) {
    this.displayList.erase(child);
  },

  swapChildren: function(indexA, indexB) {

    var childA = this.getChildAt(indexA),
        childB = this.getChildAt(indexB);

    if(childA && childB) {
      this.displayList[indexA] = childB;
      this.displayList[indexB] = childA;
    }
  },

  getChildAt: function(index) {
    if(this.displayList[index]) {
      return this.displayList[index];
    }
    return null;
  },

  getIndexOfChild: function(child) {
    var found = false,
        i = 0,
        max = this.displayList.length-1;

    for(var i = max; i >= 0; i-- ) {
      if(this.displayList[i] === child) {
        found = i;
        break;
      }
    }

    return found;
  },

  removeChildAt: function(index) {

    var removed = null;

    if (this.displayList.length >= index) {
      removed = this.displayList.splice(index, 1)[0];
      if(removed === this.selected) {
        this.selected = null;
      }
    }

    return removed;

  },

  count: function() {
    return this.displayList.length;
  },

  // Other Canvas methods
  // --------------------

  getText: function(redraw) {
    if(redraw) {
      this.draw(true);
    }
    return this.txt;
  },

  toJSON: function() {
    var json = {displayList:[]};
    Array.each(this.displayList, function(item, index, array) {
      json.displayList.push(item.toJSON());
    }, this);

    return json;
  },

  fromJSON: function(json) {

    var errors = [];

    if(typeof json !== 'object') {
      json = JSON.decode(json);
    }

    if(json.displayList) {

      this.displayList = [];

      Array.each(json.displayList, function(item, index, obj) {
        try {
          var newObj = DisplayObjectFactory.create(item);
          this.displayList.push(newObj);
        }
        catch (e) {
          errors.push(e);
        }
      }, this);

      if(errors.length) {
        console.log('Errors encountered while opening file: ', errors);
      }

      return true;

    }
    else {
      return false;
    }
  }

});