;(function() {
  'use strict';

  var React;
  var ModalFormAnchor;
  var PropTypes;
  if (typeof require !== 'undefined') {
    React = require('react');
    PropTypes = require('prop-types');
    ModalFormAnchor = require('./anchor');
  } else if (typeof window !== 'undefined') {
    React = window.React;
    PropTypes = window.PropTypes;
    ModalFormAnchor = window.ZUIModalFormAnchor;
  }

  var ESC_KEY = 27;

  var UNDERLAY_STYLE = {
    left: 0,
    position: 'absolute',
    top: 0
  };

  var FORM_STYLE = {
    position: 'absolute'
  };

  function ModalFormBase() {
    React.Component.apply(this, arguments);
    this.reposition = this.reposition.bind(this);
    this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
    this.handleGlobalNavigation = this.handleGlobalNavigation.bind(this);
    this.state = {
      underlayWidth: 0,
      underlayHeight: 0
    };
  }

  ModalFormBase.locationChangeEvent = 'locationchange';

  ModalFormBase.propTypes = {
    tag: PropTypes.node,
    required: PropTypes.bool,
    underlayStyle: PropTypes.object,
    persistAcrossLocations: PropTypes.bool,
    loose: PropTypes.bool,
    onReposition: PropTypes.func,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
  };

  ModalFormBase.defaultProps = {
    tag: 'form',
    required: false,
    underlayStyle: {},
    persistAcrossLocations: false,
    loose: false,
    onReposition: Function.prototype,
    onSubmit: Function.prototype,
    onCancel: Function.prototype
  };

  ModalFormBase.prototype = Object.assign(Object.create(React.Component.prototype), {
    _originalScrollPosition: null,

    componentWillMount: function() {
      if (typeof pageXOffset !== 'undefined') {
        // Mounting a modal with `autoFocus` content scrolls to the top before it repositions.
        this._originalScrollPosition = [pageXOffset, pageYOffset];
      }
      this.reposition = this.reposition.bind(this);
    },

    componentDidMount: function() {
      addEventListener('scroll', this.reposition);
      addEventListener('resize', this.reposition);
      addEventListener('keydown', this.handleGlobalKeyDown);
      addEventListener('hashchange', this.handleGlobalNavigation);
      addEventListener(ModalFormBase.locationChangeEvent, this.handleGlobalNavigation);
      this.reposition();
      if (this._originalScrollPosition !== null) {
        scrollTo.apply(null, this._originalScrollPosition);
      }
    },

    componentWillUnmount: function() {
      removeEventListener('scroll', this.reposition);
      removeEventListener('resize', this.reposition);
      removeEventListener('keydown', this.handleGlobalKeyDown);
      removeEventListener('hashchange', this.handleGlobalNavigation);
      removeEventListener(ModalFormBase.locationChangeEvent, this.handleGlobalNavigation);
    },

    componentDidUpdate: function() {
      var reposition = this.reposition;
      requestAnimationFrame(function(){
        requestAnimationFrame(reposition);
      });
    },

    handleGlobalKeyDown: function (event) {
      if (event.which === ESC_KEY && !this.props.required) {
        this.props.onCancel.apply(null, arguments);
      }
    },

    handleGlobalNavigation: function() {
      if (!this.props.persistAcrossLocations) {
        this.props.onCancel.apply(null, arguments);
      }
    },

    getUnderlayChildren: function() {
      var method;
      var onSubmit;
      if (this.props.tag === 'form') {
        method = 'POST';
        onSubmit = this.handleFormSubmit.bind(this)
      }

      return React.createElement(this.props.tag, {
        ref: 'form',
        className: ('modal-form ' + (this.props.className || '')).trim(),
        method: method,
        style: Object.assign({}, FORM_STYLE, this.props.style),
        onSubmit: onSubmit
      }, this.props.children);
    },

    render: function() {
      if (this.props.loose) {
        return this.renderLoose();
      } else {
        return this.renderWithAnchor();
      }
    },

    renderLoose: function() {
      var underlaySize = {
        width: this.state.underlayWidth + 'px',
        height: this.state.underlayHeight + 'px'
      };
      return React.createElement.apply(React, ['div', {
        ref: 'underlay',
        className: ('modal-form-underlay ' + (this.props.className || '')).trim(),
        style: Object.assign({}, UNDERLAY_STYLE, underlaySize, this.props.underlayStyle),
        onClick: this.handleUnderlayClick.bind(this)
      }].concat(this.getUnderlayChildren()));
    },

    renderWithAnchor: function() {
      var looseRenderResult = this.renderLoose.apply(this, arguments);
      return React.createElement(ModalFormAnchor, null, looseRenderResult);
    },

    reposition: function() {
      if (this.refs && this.refs.form) {
        var formRect = this.refs.form.getBoundingClientRect();
        var formStyle = getComputedStyle(this.refs.form);
        var formRight = pageXOffset + formRect.right + parseFloat(formStyle.marginRight);
        var formBottom = pageYOffset + formRect.bottom + parseFloat(formStyle.marginBottom);
        var totalWidth = Math.max(document.documentElement.offsetWidth, formRight); // Skip `innerWidth` to avoid counting scrollbar.
        var totalHeight = Math.max(document.documentElement.offsetHeight, innerHeight, formBottom);
        if (totalWidth !== this.state.underlayWidth || totalHeight !== this.state.underlayHeight) {
          this.setState({
            underlayWidth: totalWidth,
            underlayHeight: totalHeight
          });
        }
        this.props.onReposition();
      }
    },

    handleFormSubmit: function(event) {
      event.preventDefault();
      this.props.onSubmit.apply(null, arguments);
    },

    handleUnderlayClick: function(event) {
      if (!this.props.required && event.target === this.refs.underlay) {
        this.props.onCancel.apply(null, arguments);
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ModalFormBase;
  } else if (typeof window !== 'undefined') {
    window.ZUIModalFormBase = ModalFormBase;
  }
}());
