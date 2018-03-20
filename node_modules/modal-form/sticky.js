;(function() {
  'use strict';

  var React;
  var ReactDOM;
  var PropTypes;
  var ModalFormBase;
  if (typeof require !== 'undefined') {
    React = require('react');
    ReactDOM = require('react-dom');
    PropTypes = require('prop-types');
    ModalFormBase = require('./base');
  } else if (typeof window !== 'undefined') {
    React = window.React;
    ReactDOM = window.ReactDOM;
    PropTypes = window.PropTypes;
    ModalFormBase = window.ZUIModalFormBase;
  }

  var MEDIA_SELECTOR = 'img, video';

  var POINTER_STYLE = {
    position: 'absolute'
  };

  function StickyModalForm() {
    ModalFormBase.apply(this, arguments);
  }

  StickyModalForm.propTypes = Object.assign({}, ModalFormBase.propTypes, {
    side: PropTypes.oneOf([
      'left',
      'right',
      'top',
      'bottom'
    ]),
    pointerStyle: PropTypes.object
  });

  StickyModalForm.defaultProps = Object.assign({}, ModalFormBase.defaultProps, {
    side: 'bottom',
    pointerStyle: {}
  });

  StickyModalForm.prototype = Object.assign(Object.create(ModalFormBase.prototype), {
    componentDidMount: function() {
      ModalFormBase.prototype.componentDidMount.apply(this, arguments);
      // TODO: Figure out a way to add a global load event listener.
      Array.prototype.forEach.call(document.querySelectorAll(MEDIA_SELECTOR), function(media) {
        media.addEventListener('load', this.reposition)
      }, this);
    },

    componentWillUnmount: function() {
      ModalFormBase.prototype.componentWillUnmount.apply(this, arguments);
      Array.prototype.forEach.call(document.querySelectorAll(MEDIA_SELECTOR), function(media) {
        media.removeEventListener('load', this.reposition)
      }, this);
    },

    reposition: function() {
      ModalFormBase.prototype.reposition.apply(this, arguments);

      var anchor = ReactDOM.findDOMNode(this).parentNode;
      var anchorRect = this.getRectWithMargin(anchor);

      var anchorClipParent = anchor;
      while(anchorClipParent !== document.body && getComputedStyle(anchorClipParent).overflow !== 'hidden') {
        anchorClipParent = anchorClipParent.parentNode;
      }

      var clipViewport = anchorClipParent.getBoundingClientRect();
      var visibleAnchorRect = this.anchorInsideViewport(anchorRect, clipViewport);

      var form = this.refs.form;
      form.style.left = '';
      form.style.top = '';
      var formRect = this.getRectWithMargin(form);
      var formPosition = this.getPosition[this.props.side].call(this, formRect, visibleAnchorRect);
      form.style.left = this.checkBoundaryWidth(formPosition.left, formRect.width);
      form.style.top = parseInt(pageYOffset + formPosition.top) + 'px';

      var pointer = this.refs.pointer;
      pointer.style.left = '';
      pointer.style.top = '';
      var pointerRect = this.getRectWithMargin(pointer);
      var pointerPosition = this.getPosition[this.props.side].call(this, pointerRect, visibleAnchorRect);
      pointer.style.left = pageXOffset + pointerPosition.left + 'px';
      pointer.style.top = pageYOffset + pointerPosition.top + 'px';
    },

    checkBoundaryWidth: function(formLeft, formWidth){
      var viewWidth = window.innerWidth;
      var repositionedLeft = formLeft;
      var formRight = formLeft + formWidth;
      if (formRight > viewWidth) {
        repositionedLeft = formLeft - (formRight - viewWidth);
      } else if (formLeft < 0) {
        repositionedLeft = 0;
      }
      return parseInt(pageXOffset + repositionedLeft) + 'px';
    },

    getRectWithMargin: function(domNode) {
      var rect = domNode.getBoundingClientRect();
      var style = getComputedStyle(domNode);
      var result = {
        top: rect.top - (parseFloat(style.marginTop) || 0),
        right: rect.right + (parseFloat(style.marginRight) || 0),
        bottom: rect.bottom + (parseFloat(style.marginBottom) || 0),
        left: rect.left - (parseFloat(style.marginLeft) || 0)
      };
      result.width = result.right - result.left,
      result.height = result.bottom - result.top
      return result;
    },

    anchorInsideViewport: function(anchorRect, viewport) {
      var visibleAnchor = {};
      if (anchorRect.left + anchorRect.width > viewport.left + viewport.width){
        visibleAnchor.right = viewport.left + viewport.width;
      } else {
        visibleAnchor.right = anchorRect.left + anchorRect.width
      }
      if (anchorRect.left < viewport.left) {
        visibleAnchor.left = viewport.left;
      } else {
        visibleAnchor.left = anchorRect.left
      }
      if (anchorRect.top < viewport.top){
        visibleAnchor.top = viewport.top;
      } else {
        visibleAnchor.top = anchorRect.top
      }
      if (anchorRect.top + anchorRect.height > viewport.top + viewport.height){
        visibleAnchor.bottom = viewport.top + viewport.height;
      } else {
        visibleAnchor.bottom = anchorRect.top + anchorRect.height
      }

      visibleAnchor.width = visibleAnchor.right - visibleAnchor.left
      visibleAnchor.height = visibleAnchor.bottom - visibleAnchor.top
      return visibleAnchor;
    },

    getHorizontallyCenteredLeft: function(movableRect, anchorRect) {
      var left = anchorRect.left - ((movableRect.width - anchorRect.width) / 2);
      left = Math.max(left, -1 * pageXOffset);
      return left;
    },

    getVerticalCenteredTop: function(movableRect, anchorRect) {
      var top = anchorRect.top - ((movableRect.height - anchorRect.height) / 2);
      top = Math.max(top, -1 * pageYOffset);
      return top;
    },

    getPosition: {
      left: function(movableRect, anchorRect) {
        return {
          left: anchorRect.left - movableRect.width,
          top: this.getVerticalCenteredTop.apply(this, arguments)
        }
      },

      right: function(movableRect, anchorRect) {
        return {
          left: anchorRect.right,
          top: this.getVerticalCenteredTop.apply(this, arguments)
        }
      },

      top: function(movableRect, anchorRect) {
        return {
          left: this.getHorizontallyCenteredLeft.apply(this, arguments),
          top: anchorRect.top - movableRect.height,
        };
      },

      bottom: function(movableRect, anchorRect) {
        return {
          left: this.getHorizontallyCenteredLeft.apply(this, arguments),
          top: anchorRect.bottom,
        };
      }
    },

    getUnderlayChildren: function() {
      var pointer = React.createElement('div', {
        ref: 'pointer',
        className: ('modal-form-pointer ' + (this.props.className || '')).trim(),
        style: Object.assign({}, POINTER_STYLE, this.props.pointerStyle)
      });
      var originalChildren = ModalFormBase.prototype.getUnderlayChildren.apply(this, arguments);
      return [].concat(originalChildren, pointer);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = StickyModalForm;
  } else if (typeof window !== 'undefined') {
    window.ZUIStickyModalForm = StickyModalForm;
  }
}());
