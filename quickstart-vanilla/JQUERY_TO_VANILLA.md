# jQuery to Vanilla JavaScript Conversion Reference

This document shows the conversions made from jQuery to vanilla JavaScript in this project.

## DOM Selection

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$('#id')` | `document.getElementById('id')` | Get element by ID |
| `$('.class')` | `document.querySelectorAll('.class')` | Get elements by class (returns NodeList) |
| `$('div')` | `document.querySelectorAll('div')` | Get elements by tag |
| `$('#parent .child')` | `document.querySelector('#parent .child')` | CSS selector (first match) |
| `$('#parent .child')` | `document.querySelectorAll('#parent .child')` | CSS selector (all matches) |
| `$container.find('button')` | `container.querySelector('button')` | Find child element |
| `$(selector, context)` | `context.querySelector(selector)` | Scoped selection |

## DOM Manipulation

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$el.html('text')` | `el.innerHTML = 'text'` | Set HTML content |
| `$el.html()` | `el.innerHTML` | Get HTML content |
| `$el.text('text')` | `el.textContent = 'text'` | Set text content |
| `$el.val()` | `el.value` | Get input value |
| `$el.val('text')` | `el.value = 'text'` | Set input value |
| `$el.append(child)` | `el.appendChild(child)` | Add child element |
| `$el.remove()` | `el.remove()` | Remove element |
| `$el.empty()` | `el.innerHTML = ''` | Clear children |

## CSS and Styles

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$el.css('color', 'red')` | `el.style.color = 'red'` | Set single style |
| `$el.css('color')` | `el.style.color` | Get style |
| `$el.addClass('active')` | `el.classList.add('active')` | Add class |
| `$el.removeClass('active')` | `el.classList.remove('active')` | Remove class |
| `$el.toggleClass('active')` | `el.classList.toggle('active')` | Toggle class |
| `$el.hasClass('active')` | `el.classList.contains('active')` | Check class |
| `$el.show()` | `el.style.display = ''` | Show element |
| `$el.hide()` | `el.style.display = 'none'` | Hide element |

## Attributes

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$el.attr('data-id')` | `el.getAttribute('data-id')` | Get attribute |
| `$el.attr('data-id', '5')` | `el.setAttribute('data-id', '5')` | Set attribute |
| `$el.removeAttr('data-id')` | `el.removeAttribute('data-id')` | Remove attribute |
| `$el.prop('checked')` | `el.checked` | Get property |
| `$el.data('key')` | `el.dataset.key` | Get data attribute |

## Events

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$el.click(handler)` | `el.addEventListener('click', handler)` | Add click handler |
| `$el.on('click', handler)` | `el.addEventListener('click', handler)` | Add event listener |
| `$el.off('click', handler)` | `el.removeEventListener('click', handler)` | Remove event listener |
| `$el.trigger('click')` | `el.click()` or `el.dispatchEvent(new Event('click'))` | Trigger event |
| `$(document).ready(fn)` | `document.addEventListener('DOMContentLoaded', fn)` | DOM ready |
| `$(window).on('load', fn)` | `window.addEventListener('load', fn)` | Window load |

## Creating Elements

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$('<div>')` | `document.createElement('div')` | Create element |
| `$('<div>Text</div>')` | `const div = document.createElement('div'); div.textContent = 'Text'` | Create with text |
| `$('<div class="box">')` | `const div = document.createElement('div'); div.className = 'box'` | Create with class |

## Array/Object Operations

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$.each(arr, fn)` | `arr.forEach(fn)` | Iterate array |
| `$.map(arr, fn)` | `arr.map(fn)` | Map array |
| `$.extend(obj1, obj2)` | `Object.assign(obj1, obj2)` | Merge objects |
| `$.isArray(val)` | `Array.isArray(val)` | Check if array |

## AJAX (Not used in this project, but for reference)

| jQuery | Vanilla JavaScript | Notes |
|--------|-------------------|-------|
| `$.ajax({ url, method })` | `fetch(url, { method })` | AJAX request |
| `$.get(url)` | `fetch(url).then(r => r.text())` | GET request |
| `$.post(url, data)` | `fetch(url, { method: 'POST', body: data })` | POST request |
| `$.getJSON(url)` | `fetch(url).then(r => r.json())` | Get JSON |

## Examples from This Project

### Example 1: Modal Selection (selectroom.js)

**jQuery:**
```javascript
const $alert = $('div.alert', $modal);
const $changeMedia = $('button.btn-dark', $modal);
const $identity = $('#screen-name', $modal);
```

**Vanilla JS:**
```javascript
const alert = modal.querySelector('div.alert');
const changeMediaButton = modal.querySelector('button.btn-dark');
const identityInput = modal.querySelector('#screen-name');
```

### Example 2: Event Handlers (joinroom.js)

**jQuery:**
```javascript
$container.on('click', () => {
  // handler code
});

$leave.click(function onLeave() {
  $leave.off('click', onLeave);
  room.disconnect();
});
```

**Vanilla JS:**
```javascript
container.addEventListener('click', () => {
  // handler code
});

function handleLeave() {
  leaveButton.removeEventListener('click', handleLeave);
  room.disconnect();
}
leaveButton.addEventListener('click', handleLeave);
```

### Example 3: DOM Manipulation (joinroom.js)

**jQuery:**
```javascript
const $container = $(`<div class="participant" data-identity="${identity}" id="${sid}">
  <audio autoplay ${muted ? 'muted' : ''}></audio>
  <video autoplay muted playsinline></video>
</div>`);

$participants.append($container);
```

**Vanilla JS:**
```javascript
const container = document.createElement('div');
container.className = 'participant';
container.setAttribute('data-identity', identity);
container.id = sid;

const audio = document.createElement('audio');
audio.autoplay = true;
if (muted) audio.muted = true;

const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.playsInline = true;

container.appendChild(audio);
container.appendChild(video);
participantsContainer.appendChild(container);
```

### Example 4: Styles and Classes (joinroom.js)

**jQuery:**
```javascript
$activeParticipant.removeClass('active');
$activeParticipant.removeClass('pinned');
$activeVideo.css('opacity', '0');
$participant.addClass('active');
```

**Vanilla JS:**
```javascript
previousContainer.classList.remove('active', 'pinned');
activeVideoElement.style.opacity = '0';
participantContainer.classList.add('active');
```

### Example 5: Attributes (selectmedia.js)

**jQuery:**
```javascript
const maxLevel = Number($levelIndicator.attr('height'));
$levelIndicator.attr('y', maxLevel - level);
```

**Vanilla JS:**
```javascript
const maxLevel = Number(levelIndicator.getAttribute('height'));
levelIndicator.setAttribute('y', maxLevel - level);
```

## Important Notes

### NodeList vs Array
`querySelectorAll()` returns a NodeList, not an Array. Most array methods work, but to be safe:

```javascript
// Convert to array if needed
const elementsArray = Array.from(document.querySelectorAll('.class'));

// Or use forEach directly (works on NodeList)
document.querySelectorAll('.class').forEach(el => {
  // do something
});
```

### Event Delegation
jQuery made event delegation easy with `.on(event, selector, handler)`. In vanilla JS:

```javascript
// jQuery
$('#parent').on('click', '.child', handler);

// Vanilla JS
document.getElementById('parent').addEventListener('click', (e) => {
  if (e.target.matches('.child')) {
    handler(e);
  }
});
```

### Bootstrap Modals Still Use jQuery
Bootstrap 4 modals require jQuery. In this project, we kept jQuery specifically for:

```javascript
// These calls still use jQuery (via window.$)
window.$(modal).modal('show');
window.$(modal).modal('hide');
modal.addEventListener('shown.bs.modal', handler);  // But events use vanilla JS
```

To fully remove jQuery, you would need to either:
1. Use Bootstrap 5 (no jQuery dependency)
2. Use a vanilla JS modal library
3. Write custom modal code

## Performance Considerations

Vanilla JavaScript is generally:
- **Faster**: No jQuery overhead
- **Lighter**: Smaller bundle size
- **More Direct**: Direct browser API access

However, for this small application, the performance difference is negligible. The main benefits are:
- Learning how browsers actually work
- Better understanding of JavaScript
- Less dependency on external libraries
- More control over the code

## Browser Support

All the vanilla JavaScript used in this project is supported by modern browsers:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

For older browser support, you would need polyfills or transpilation with Babel.
