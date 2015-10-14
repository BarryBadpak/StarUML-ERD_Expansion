define(function (require, exports, module) {
    "use strict";
    // This extension provides an expansion of the ER Diagrams view
    // The current view lacks information on nullable and unique
    var COMPARTMENT_ITEM_INTERVAL = 2,
        COMPARTMENT_LEFT_PADDING = 5,
        COMPARTMENT_RIGHT_PADDING = 5,
        COMPARTMENT_TOP_PADDING = 5,
        COMPARTMENT_BOTTOM_PADDING = 5; 

    type.ERDColumn.prototype.getNullableString = function() {
        var _s = "";
        if(this.nullable)
          _s = "N";

        return _s;
    };
    type.ERDColumn.prototype.getUniqueString = function() {
        var _s = "";
        if(this.unique)
          _s = "U";

        return _s;
    };

    type.ERDColumnView.prototype.draw = function(canvas) {
        this.assignStyleToCanvas(canvas);

        if (this.model) {
            canvas.textOut(this.left, this.top, this.model.getKeyString());
            canvas.textOut(this.left + this._nameOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getNameString());
            canvas.textOut(this.left + this._typeOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getTypeString());
            canvas.textOut(this.left + this._nullableOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getNullableString());
            canvas.textOut(this.left + this._uniqueOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getUniqueString());
        }
        type.View.prototype.draw.call(this, canvas);
    };

    type.ERDColumnCompartmentView.prototype.size = function(canvas) {
        this.arrange(canvas);
        var i, len, item, _keyWidth = 0,
            _nameWidth = 0,
            _typeWidth = 0,
            _nullableWidth = 0,
            _uniqueWidth = 0;

        // Compute min-width of key, name, and type column 
        var _key, _name, _type, _nullable, _unique;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            if (item.visible && item.model) {
                _key = canvas.textExtent(item.model.getKeyString()).x;
                _name = canvas.textExtent(item.model.getNameString()).x;
                _type = canvas.textExtent(item.model.getTypeString()).x;
                _nullable = canvas.textExtent(item.model.getNullableString()).x;
                _unique = canvas.textExtent(item.model.getUniqueString()).x
                _keyWidth = Math.max(_keyWidth, _key);
                _nameWidth = Math.max(_nameWidth, _name);
                _typeWidth = Math.max(_typeWidth, _type);
                _nullableWidth = Math.max(_nullableWidth, _nullable);
                _uniqueWidth = Math.max(_uniqueWidth, _unique);
            }
        }

        this._nameOffset = _keyWidth + COMPARTMENT_RIGHT_PADDING;
        this._typeOffset = this._nameOffset + COMPARTMENT_LEFT_PADDING + _nameWidth + COMPARTMENT_RIGHT_PADDING;
        this._nullableOffset = this._typeOffset + COMPARTMENT_LEFT_PADDING + _typeWidth + COMPARTMENT_RIGHT_PADDING;
        this._uniqueOffset   = this._nullableOffset + (_uniqueWidth == 0 ? 0 : COMPARTMENT_LEFT_PADDING) + _nullableWidth + (_uniqueWidth == 0 ? 0 : COMPARTMENT_RIGHT_PADDING);

        // Compute size
        var w = 0,
            h = 0;
        for (i = 0, len = this.subViews.length; i < len; i++) {
            item = this.subViews[i];
            item._nameOffset = this._nameOffset;
            item._typeOffset = this._typeOffset;
            item._nullableOffset = this._nullableOffset;
            item._uniqueOffset = this._uniqueOffset;
            item._width = this._uniqueOffset + COMPARTMENT_LEFT_PADDING + _uniqueWidth;
            if (item.parentStyle) {
                item.font.size = item._parent.font.size;
            }
            item.size(canvas);
            if (item.visible) {
                if (w < item.minWidth) {
                    w = item.minWidth;
                }
                if (i > 0) {
                    h += COMPARTMENT_ITEM_INTERVAL;
                }
                h += item.minHeight;
            }
        }
  
        this.minWidth = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING;
        this.minHeight = h + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
        this.sizeConstraints();
    };

    type.ERDEntityView.prototype.drawObject = function(canvas) {
        this.columnCompartment.size(canvas);

        canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
        canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
        if (this.columnCompartment.subViews.length > 0) {
            canvas.line(this.left, this.columnCompartment.top, this.getRight(), this.columnCompartment.top);
            var _x1 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._nameOffset,
                _x2 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._typeOffset;
            canvas.line(_x1, this.columnCompartment.top, _x1, this.getBottom());
            canvas.line(_x2, this.columnCompartment.top, _x2, this.getBottom());

            var i, len, item;
            var hasNullable = false,
                hasUnique   = false;
            for (i = 0, len = this.columnCompartment.subViews.length; i < len; i++) {
                item = this.columnCompartment.subViews[i].model;
                if(item.unique) hasUnique = true;
                if(item.nullable) hasNullable = true;
            }

            if(hasNullable) {
                console.log('a');
              var _x3 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._nullableOffset;
              canvas.line(_x3, this.columnCompartment.top, _x3, this.getBottom());
            }
            if(hasUnique) {
              var _x4 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._uniqueOffset;
              canvas.line(_x4, this.columnCompartment.top, _x4, this.getBottom());
            }
        }
        type.NodeView.prototype.drawObject.call(this, canvas);
    };
});