var alignit = (function() {
    var _reWhitespace = /[\s\,]\s*/,
        _reAlignOffset = /^(.*?)([\-\+]?\d*)$/,
        _aligners = {
            left: function(b, pb, offset) {
                this.style.marginLeft = (offset || 0) + 'px';
            },
            
            center: function(b, pb, offset) {
                this.style.marginLeft = (((pb.width - b.width) >> 1) + (offset || 0)) + 'px';
            },
            
            right: function(b, pb, offset) {
                this.style.marginLeft = (pb.width - b.width + (offset || 0)) + 'px';
            },
            
            top: function(b, pb, offset) {
                this.style.marginTop = (offset || 0) + 'px';
            },
            
            middle: function(b, pb, offset) {
                this.style.marginTop = (((pb.height - b.height) >> 1) + (offset || 0)) + 'px';
            },
            
            bottom: function(b, pb, offset) {
                this.style.marginTop = (pb.height - b.height + (offset || 0)) + 'px';
            }
        };

    function _bounds(target) {
        var rect = target.getBoundingClientRect();
        
        if (typeof rect.width == 'undefined') {
            rect = {
                width: rect.right - rect.left,
                height: rect.bottom - rect.top,
                
                // pass through the original properties
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right
            };
        }
        
        return rect;
    }
        
    function _alignit(element, alignment, alignTarget) {
        // if we have an element and a containing node, then process
        if (element && element.parentNode) {
            var aligns = (alignment || '').split(_reWhitespace),
                alignA = _reAlignOffset.exec(aligns[0]) || [, 'left', 0],
                alignB = _reAlignOffset.exec(aligns[1]) || [, 'top', 0],
                alignerA = _aligners[alignA[1]] || _aligners.left,
                alignerB = _aligners[alignB[1]] || _aligners.top,
                bounds = _bounds(element),
                parentBounds = _bounds(alignTarget || element.parentNode);
                
            // set the position to absolute
            element.style.position = 'absolute';
            
            // fix IE
            if (typeof bounds.width == 'undefined') {
                bounds = _calculateSize(bounds);
                parentBounds = _calculateSize(parentBounds);
            }
            
            // position the element
            alignerA.call(element, bounds, parentBounds, parseInt(alignA[2], 10));
            alignerB.call(element, bounds, parentBounds, parseInt(alignB[2], 10));
        }
    };
    
    _alignit.bounds = _bounds;
    
    return _alignit;
}());