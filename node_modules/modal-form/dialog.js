;(function() {
  'use strict';

  var React;
  var ReactDOM;
  var PropTypes;
  var createReactClass;
  var ModalFormBase;
  if (typeof require !== 'undefined') {
    React = require('react');
    ReactDOM = require('react-dom');
    PropTypes = require('prop-types');
    createReactClass = require('create-react-class');
    ModalFormBase = require('./base');
  } else if (typeof window !== 'undefined') {
    React = window.React;
    ReactDOM = window.ReactDOM;
    PropTypes = window.PropTypes;
    ModalFormBase = window.ZUIModalFormBase;
  }

  var ModalDialog = createReactClass({ 
    statics: {
      alert: function(message, props) {
        var container = document.createElement('div');
        document.body.appendChild(container);

        var promise = new Promise(function(resolve, reject) {
          function handleSubmit() {
            resolve.apply(null, arguments);
            if (props && props.onSubmit !== undefined) {
              props.onSubmit.apply(null, arguments);
            }
          }

          function handleCancel() {
            reject.apply(null, arguments);
            if (props && props.onCancel !== undefined) {
              props.onCancel.apply(null, arguments);
            }
          }

          ReactDOM.render(React.createElement(ModalDialog, Object.assign({}, props, {
            onSubmit: handleSubmit,
            onCancel: handleCancel
          }), message), container);
        });

        promise.catch(Function.prototype).then(function() {
          ReactDOM.unmountComponentAtNode(container);
          container.parentNode.removeChild(container);
        });

        return promise;
      }
    },

    propTypes: Object.assign({}, ModalFormBase.propTypes, {
      closeButton: PropTypes.bool,
      left: PropTypes.number,
      top: PropTypes.number
    }),

    getDefaultProps: function() {
      return Object.assign({}, ModalFormBase.defaultProps, {
        closeButton: false,
        left: 0.5,
        top: 0.4
      });
    },

    getInitialState: function() {
      return {
        scrollX: pageXOffset,
        scrollY: pageYOffset,
        dialogLeft: -1000,
        dialogTop: -1000
      };
    },

    render: function() {
      var positionStyle = {
        left: this.state.dialogLeft,
        top: this.state.dialogTop
      };

      var modalProps = Object.assign({
        ref: 'modal',
        role: 'dialog'
      }, this.props, {
        className: ('modal-dialog ' + (this.props.className || '')).trim(),
        style: Object.assign({}, positionStyle, this.props.style),
        onReposition: this.reposition
      });

      var closeButton;
      if (this.props.closeButton) {
        closeButton = React.createElement('button', {
          type: 'button',
          className: 'modal-dialog-toolbar-button modal-dialog-close-button',
          title: 'Close',
          onClick: this.props.onCancel
        }, '×');
      }

      var toolbar = React.createElement('div', {
        className: 'modal-dialog-toolbar'
      }, closeButton);

      return React.createElement(ModalFormBase, modalProps, toolbar, this.props.children);
    },

    reposition: function() {
      var form = this.refs.modal && this.refs.modal.refs.form;
      if (form !== undefined) {
        var horizontal = this.props.left * innerWidth;
        var vertical = this.props.top * innerHeight;
        var left = this.state.scrollX + Math.max(0, horizontal - (this.props.left * form.offsetWidth));
        var top = this.state.scrollY + Math.max(0, vertical - (this.props.top * form.offsetHeight));
        if (left !== this.state.dialogLeft || top !== this.state.dialogTop) {
          this.setState({
            dialogLeft: parseInt(left),
            dialogTop: parseInt(top)
          });
        }
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ModalDialog;
  } else if (typeof window !== 'undefined') {
    window.ZUIModalDialog = ModalDialog;
  }
}());
