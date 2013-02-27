(function($, ko) {
  var specialProperties = [
    // sidestep
    'clearClearable',

    // ko text/appearance
    'visible',
    'text',
    'html',
    'css',
    'style',
    'attr',

    // ko control flow
    'foreach',
    'if',
    'ifnot',
    'with',

    // ko form fields
    'click',
    'event',
    'submit',
    'enable',
    'disable',
    'value',
    'hasfocus',
    'checked',
    'options',
    'selectedOptions',
    'uniqueName',
    'template'
  ]

  /**
   * Stringifies a bindings object. This is different from JSON
   * stringification, because String properties are actually included
   * verbatim rather than within a string. They are JS expressions for
   * knockout to evaluate.
   *
   * topLevel indicates whether to wrap the results in {}. Only the top
   * level bindings object gets to omit {}, as it goes directly in the
   * data-bind attribute.
   */
  function stringifyBindings(bindings, topLevel) {
    if (typeof bindings == 'string')
      return bindings;

    var stringified = "";

    for (var property in bindings) {
      var bindValue =
        (typeof bindings[property] == 'string') ?
        bindings[property] :
        stringifyBindings(bindings[property]);

      stringified += ", '" + property + "': " + bindValue;
    }

    var stringifiedProperties = stringified.substring(2);

    console.log('With ', stringifiedProperties, ' got topLevel ', topLevel)
    if (topLevel)
      return stringifiedProperties;
    else
      return '{ ' + stringifiedProperties + ' }';
  }
  function applyBindingsToSelector($container, selector, bindings) {
    var $elements = $container.find(selector);

    // This is another element to bind.
    var bindString = bindAndGenerateBindStringFrom(bindings, $elements);

    if (bindString)
      $(selector).attr('data-bind', bindString);
  }
  function bindAndGenerateBindStringFrom(bindings, $container) {
    var bindObject = {};

    for (var property in bindings) {
      if ($.inArray(property, specialProperties) > -1) {
        var bindString = stringifyBindings(bindings[property])

        bindObject[property] = bindString;
      } else {
        applyBindingsToSelector($container, property, bindings[property]);
      }
    }

    return stringifyBindings(bindObject, true);
  }

  window.sidestep = {
    applyBindings: function(data, bindings) {
      var clearClearable = (typeof bindings.clearClearable == 'undefined') ? false : bindings.clearClearable;

      for (var property in bindings) {
        if (property != 'clearClearable') {
          if (clearClearable)
            $(property).find('.clearable').remove();

          applyBindingsToSelector($(document), property, bindings[property]);
        }
      }
    }
  }
})(jQuery, null);

$(document).ready(function() {
  sidestep.applyBindings({}, {
    clearClearable: true,
    ".search-results": {
      foreach: 'currentPage',

      'li': {
        attr: { 'class': 'typeMarker' },

        'ul.stats': {
          foreach: 'stats',

          'li': {
            text: 'count + " " + pluralize(count, capitalize(name))'
          }
        },

        'img.logo': {
          attr: { src: 'logoURL', alt: 'name + " Logo""' }
        },

        'ul.regions': {
          foreach: 'regions',

          'li': {
            'h4': { text: '$data' },

            'ul.processes': {
              foreach: 'processes',

              'li': { text: '$data' }
            }
          }
        }
      }
    }
  })
});
