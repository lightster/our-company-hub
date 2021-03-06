(function() {
  function makeHeaderAnchor(sizeClass, idFinderCallback) {
    return function() {
      var $a = $('<a class="header-anchor"><i class="fa fa-paragraph"></i></a>');
      $a.addClass(sizeClass);
      $a.attr('href', '#' + idFinderCallback($(this)));

      return $a;
    };
  }

  $('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]')
    .prepend(makeHeaderAnchor('hidden-sm-down', function($header) {
      return $header.attr('id');
    }))
    .append(makeHeaderAnchor('hidden-md-up', function($header) {
      return $header.attr('id');
    }));
  $('.anchorable')
    .prepend(makeHeaderAnchor('hidden-sm-down', function($header) {
      return $header.parents('[id]').first().attr('id');
    }))
    .append(makeHeaderAnchor('hidden-md-up', function($header) {
      return $header.parents('[id]').first().attr('id');
    }));

  $('.paydate').each(function() {
    var $this = $(this);
    var payrollConfig = $this.data('payroll-date');
    if (!payrollConfig) {
      return;
    }

    var paySchedule = lstrPayrollDates(payrollConfig);
    var nextPaydate = paySchedule.next()[0];
    var monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
    ];
    $this.text(monthNames[nextPaydate.getUTCMonth()] + ' ' + nextPaydate.getUTCDate());
  });


  var mainSearchIndex = null;
  var mainSearchCallback = function (searchText, resultHandler) {
    if (mainSearchIndex) {
      resultHandler.setResults(resultHandler.sorters.tracker('hub-main').sort(mainSearchIndex.filter(function (link) {
        return resultHandler.filters.isMatch(searchText.toLowerCase(), link.query)
      }), searchText).slice(0, 100));
      return;
    }


    jQuery.ajax({
      url: $('body').data('search-url'),
      dataType: 'json',
      error: function (error, msg) {
        console.log(msg, error);
      },
      success: function (results) {
        mainSearchIndex = results.map(function (link) {
          var processed = {
            text: link.title,
            query: link.title + ' ' + link.description,
            href: link.href,
          };
          if (link.collection) {
            processed.description = link.collection;
            processed.query += " " + link.collection;
          }
          processed.query = processed.query.toLowerCase();
          processed.trackerId = processed.query;

          return processed;
        });
        resultHandler.setResults(resultHandler.sorters.tracker('hub-main').sort(mainSearchIndex.filter(function (link) {
          return resultHandler.filters.isMatch(searchText.toLowerCase(), link.query)
        }), searchText).slice(0, 100));
      }
    });
  };

  var qs = lstrQuickSwitcher({
    searchCallback: mainSearchCallback,
    selectCallback: function(selected) {
      var selectedValue = selected.selectedValue;
      selected.trackAs('hub-main');

      if (event[this.modifierKey]) {
        window.open(selectedValue.href);
        return false;
      }

      window.location = selectedValue.href;
      this.closeSwitcher();
    },
    selectChildSearchCallback: function(selected) {
      selected.trackAs('hub-main');
    },
    searchDelay: 0,
  });

  $('.search').click(function (event) {
    qs.open();
    event.preventDefault();
  });
})();
