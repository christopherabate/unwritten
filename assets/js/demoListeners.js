document.addEventListener('foo', event => {
  console.log(
    'foo:',
    event.detail.name,
    event.detail.trigger,
    event.detail.element
  );
});

document.addEventListener('bar', event => {
  console.log(
    'bar:',
    event.detail.first,
    event.detail.last
  );
});

document.addEventListener('biz', event => {
  console.log(
    event.detail.element,
    Object.keys(event.detail)
      .filter(value => value !== 'element')
      .filter(value => value !== 'trigger')
  );
});

document.addEventListener('biz', () => {
  console.log('COUCOU!');
}, { once: true });


document.dispatchEvent(
  new CustomEvent('foo', {
    detail: {
      name: 'Alice'
    }
  })
);