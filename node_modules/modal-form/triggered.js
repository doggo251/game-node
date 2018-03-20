;(function() {
  'use strict';

  var React;
  var ReactDOM;
  var PropTypes;
  var createReactClass;
  var StickyModalForm;
  if (typeof require !== 'undefined') {
    React = require('react');
    ReactDOM = require('react-dom');
    PropTypes = require('prop-types');
    createReactClass = require('create-react-class');
    StickyModalForm = require('./sticky');
  } else if (typeof window !== 'undefined') {
    React = window.React;
    ReactDOM = window.ReactDOM;
    PropTypes = window.PropTypes;
    StickyModalForm = window.ZUIStickyModalForm;
  }

  var TriggeredModalForm = createReactClass({
    propTypes: Object.assign({}, StickyModalForm.propTypes, {
      triggerTag: PropTypes.string,
      trigger: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string
      ]),
      triggerProps: PropTypes.object,
      defaultOpen: PropTypes.bool
    }),

    getDefaultProps: function() {
      return Object.assign({}, StickyModalForm.defaultProps, {
        triggerTag: 'button',
        trigger: '☰',
        triggerProps: {},
        defaultOpen: false
      });
    },

    getInitialState: function() {
      return {
        open: this.props.defaultOpen
      };
    },

    open: function() {
      this.setState({
        open: true
      });
    },

    close: function() {
      this.setState({
        open: false
      }, function() {
        var trigger = ReactDOM.findDOMNode(this);
        if (trigger.focus) {
          trigger.focus();
        }
      });
    },

    render: function() {
      var modal = null;
      if (this.state.open) {
        var modalProps = Object.assign({}, this.props, {
          ref: 'modal',
          onSubmit: this.handleSubmit,
          onCancel: this.handleCancel
        });
        modal = React.createElement(StickyModalForm, modalProps, this.props.children);
      }

      var triggerProps = Object.assign({
        ref: 'trigger',
        type: this.props.triggerTag === 'button' ? 'button' : null,
        'aria-haspopup': true,
        'aria-expanded': this.state.open
      }, this.props.triggerProps, {
        className: [
          'modal-form-trigger',
          this.props.className || '',
          this.props.triggerProps && this.props.triggerProps.className || ''
        ].join(' ').trim(),
        onClick: this.handleClick
      });

      return React.createElement(this.props.triggerTag, triggerProps, this.props.trigger, modal);
    },

    handleClick: function() {
      this.open();
      if (this.props.triggerProps && this.props.triggerProps.onClick) {
        this.props.triggerProps.onClick.apply(null, arguments);
      }
    },

    handleSubmit: function() {
      this.close();
      if (this.props.onSubmit) {
        this.props.onSubmit.apply(null, arguments);
      }
    },

    handleCancel: function() {
      this.close();
      if (this.props.onCancel) {
        this.props.onCancel.apply(null, arguments);
      }
    },
  });

  if (typeof module !== 'undefined') {
    module.exports = TriggeredModalForm;
  } else if (typeof window !== 'undefined') {
    window.ZUITriggeredModalForm = TriggeredModalForm;
  }
}());
