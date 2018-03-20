# ModalForm

These are React components. They render a form with an screen-sized underlay preventing interaction with the page.

![Build status](https://travis-ci.org/zooniverse/modal-form.svg)

## Components

### Base

Just a form wrapped in a screen-covering underlay You'll probably never use this directly, but everything extends it. Here are its props:

* `required`: Prevent the user from canceling the modal by clicking the underlay or hitting escape? Defaults to `false`.

* `underlayStyle`: Overrides the style of the underlay.

* `persistAcrossLocations`: Don't call the `onCancel` handler when the location changes. Defaults to `false`. `hashchange` is supported by default. To track other location-changing events, trigger them manually and set `BaseModalForm.locationChangeEvent` to the event name (defaults to `"locationchange"`) before mounting any modal forms.

* `loose`: Render the form underlay directly into its parent element? Defaults to `false`, which renders it into a container the body above everything else.

* `onSubmit`: Handler for form submission. This function should probably close the modal.

* `onCancel`: Handler for when the user cancels by clicking the underlay or hitting escape. This should probably close the modal too.

### Sticky

A modal stuck to its parent like a tooltip. It'll try to stay within the bounds of the screen.

* `side`: The side (`"left"`, `"right"`, `"top"`, or `"bottom"`) of the anchor you want to stick to. Defaults to `"bottom"`.

* `pointerStyle`: Overrides the style of the pointer element.

```jsx
import React from 'react';
import StickyModalForm from 'modal-form/sticky';

class WithSticky extends React.Component {
  render() {
    return <span>
      <button type="button" onClick={this.openTooltip}>I have a tooltip.</button>
      {this.state.tooltipIsOpen
        ? <StickyModalForm onCancel={this.closeTooltip}>
            <p>Here it is.</p>
          </StickyModalForm>
        : <small>But it’s hidden.</small>}
    </span>;
  }
}
```

Looks like there's a `<p>` within a `<span>` there, but it's totally okay!

### Triggered

A button that opens a **Sticky** modal like a dropdown menu. This avoids having to manually maintain your own open/closed state.

* `triggerTag`: The type of element you want to be the trigger. Defaults to `button`.

* `trigger`: Content to put in the button. Defaults to a three-lines-hamburger; please change this.

* `triggerProps`: Any additional props for the button.

```jsx
import React from 'react';
import TriggeredModalForm from 'modal-form/triggered';

class WithTriggered extends React.Component {
  render() {
    return <p>
      Here are your options:
      <TriggeredModalForm trigger={
        <strong>Options</strong>
      } required onSubmit={this.handleSubmit}>
        <p>No way out until you choose.</p>
        <ul>
          <li><button type="submit">You must choose me.</button></li>
        </ul>
      </TriggeredModalForm>
    </p>;
  }
}
```

Again, the `<ul>` inside the `<p>` works just fine.

### Dialog

A generic dialog that takes over the screen.

* `closeButton`: A boolean to add a standard close button to the dialog. This can close a `required` dialog without submitting it. Defaults to `false`.

* `left`, `top`: Both CSS percent strings, these default to `"50%"` and `"40%"` respectively.

```jsx
import React from 'react';
import ModalFormDialog from 'modal-form/dialog';

class WithDialog extends React.Component {
  render() {
    return <p>
      Lorem ipsum, etc.
      {this.state.dialogIsOpen
        ? <ModalFormDialog>
            <p>The time is {Date.now()}.</p>
          </ModalFormDialog>
        : null}
    </p>;
  }
}
```

You can call `ModalFormDialog.alert(message, props)` to open a dialog on the fly without having to manually track its open/closed state. It returns a promise (fulfilled on submit and rejected on cancel) and the dialog closes automatically.

```jsx
import React from 'react';
import ModalFormDialog from 'modal-form/dialog';

class WithAlert extends React.Component {
  soundTheAlarms() {
    ModalFormDialog.alert(<div>
      <p>Something’s gone wrong. <button type="submit">Fix it</button></p>
    </div>)
      .then((event) => {
        console.log('All better because of', event);
      })
      .catch((event) => {
        console.log('Everything is ruined because of', event);
      });
  }
}
```
