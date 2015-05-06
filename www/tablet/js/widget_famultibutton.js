if(typeof widget_widget == 'undefined') {
    loadplugin('widget_widget');
}

var widget_famultibutton = $.extend({}, widget_widget, {
    widgetname : 'famultibutton',
    _doubleclicked: function(elem, onoff) {
        if(elem.data('doubleclick')*1>0) {
            if(! elem.data('_firstclick')) {
                elem.data('_firstclick', true);
                elem.data('_firstclick_reset', setTimeout(function() {
                    elem.data('_firstclick', false);
                }, elem.data('doubleclick')*1));
                if(onoff == 'on') {
                    elem.setOff();
                } else {
                    elem.setOn();
                }
                elem.children().filter('#bg').css('color', elem.data('firstclick-background-color'));
                elem.children().filter('#fg').css('color', elem.data('firstclick-color'));
                return false;
            } else {
                elem.data('_firstclick', false);
                clearTimeout(elem.data('_firstclick_reset'));
            }
        }
        return true;
    },
    showOverlay : function(elem, value) {
         elem.children().filter('#warn-back').remove();
         elem.children().filter('#warn').remove();
         if (value && value!=""){
             var val = ($.isNumeric(value)&&value<100)?Number(value).toFixed(0):'!';
             jQuery('<i/>', {
                 id: 'warn-back',
                 class: 'fa fa-stack-1x fa-circle'
             }).appendTo(elem);

            jQuery('<i/>', {
                 id: 'warn',
                 class: 'fa fa-stack-1x '
            }).html(val).appendTo(elem);
         }
    },
    showMultiStates : function(elem,states,state){

        var icons=elem.data('icons');
        var colors=elem.data('on-colors');

        // if data-icons isn't set, try using data-icon or fa-power-off instead
        if(typeof icons == 'undefined') {
            icons = new Array(elem.data('icon')||'fa-power-off');
        }
        // if data-colors isn't set, try using data-on-color, data-off-color or #505050 instead
        if(typeof colors == 'undefined') {
            colors = new Array(elem.data('on-color')||elem.data('off-color')||'#505050');
        }

        // fill up colors and icons to states.length
        // if an index s isn't set, use the value of s-1
        for(var s=0; s<states.length; s++) {
            if(typeof icons[s] == 'undefined') {
                icons[s]=icons[s>0?s-1:0];
            }
            if(typeof colors[s] == 'undefined') {
                colors[s]=colors[s>0?s-1:0];
            }
        }

        var elm=elem.children().filter('#fg');
        var idx=indexOfGeneric(states,state);
        if (idx>-1){
            elm.removeClass()
            .addClass('fa fa-stack-1x')
            .addClass(icons[idx])
            .css( "color", colors[idx] );
        }
    },
    toggleOn : function(elem) {
        if(this._doubleclicked(elem, 'on')) {
            var device = elem.data('device');
            var cmd = [elem.data('cmd'), device, elem.data('set-on')].join(' ');
            setFhemStatus(cmd);              
            if( device && typeof device != "undefined" && device !== " ") {
                TOAST && $.toast(cmd);
            }
        }
    },
    toggleOff : function(elem) {
        if(this._doubleclicked(elem, 'off')) {
            var device = elem.data('device');
            var cmd = [elem.data('cmd'), device, elem.data('set-off')].join(' ');
            setFhemStatus(cmd);
            if( device && typeof device != "undefined" && device !== " ") {
                TOAST && $.toast(cmd);
            }
        }
    },
    init_attr : function(elem) {
        elem.data('get',        elem.data('get')        || 'STATE');
        elem.data('cmd',        elem.data('cmd')        || 'set');
        elem.data('get-on',     elem.data('get-on')     || 'on');
        elem.data('get-off',    elem.data('get-off')    || 'off');
        elem.data('set-on',     elem.data('set-on')     || elem.data('get-on'));
        elem.data('set-off',    elem.data('set-off')    || elem.data('get-off'));
        elem.data('mode',       elem.data('mode')       || 'toggle');
        elem.data('doubleclick',                    elem.data('doubleclick')                    || 0);
        elem.data('firstclick-background-color',    elem.data('firstclick-background-color')    ||  '#6F4500');
        elem.data('firstclick-color',               elem.data('firstclick-color')               ||  null);
        readings[elem.data('get')] = true;
    },
    init_ui : function(elem) {
        var base = this;
        elem.famultibutton({
            mode: elem.data('mode'),
            toggleOn: function() { base.toggleOn(elem) },
            toggleOff: function() { base.toggleOff(elem) },
        });
        return elem;
    },
    init: function () {
        var base = this;
        this.elements = $('div[data-type="'+this.widgetname+'"]');
        this.elements.each(function(index) {
            base.init_attr($(this));
            base.init_ui($(this));
        });
    },
    update_cb : function(elem) {},
    update: function (dev,par) {
        var deviceElements= this.elements.filter('div[data-device="'+dev+'"]');
        var base = this;
        deviceElements.each(function(index) {
            if ( $(this).data('get')==par) {
                var state = getDeviceValue( $(this), 'get' );
                if (state) {
                    var states=$(this).data('get-on');
                    if ( $.isArray(states)) {
                        base.showMultiStates($(this),states,state);
                    } else {
                        var elem = $(this).data('famultibutton');
                        if (elem){
                            if ( state == $(this).data('get-on') )
                                 elem.setOn();
                            else if ( state == $(this).data('get-off') )
                                 elem.setOff();
                            else if ( state.match(new RegExp('^' + $(this).data('get-on') + '$')) )
                                 elem.setOn();
                            else if ( state.match(new RegExp('^' + $(this).data('get-off') + '$')) )
                                 elem.setOff();
                            else if ( $(this).data('get-off')=='!on' && state != $(this).data('get-on') )
                                 elem.setOff();
                            else if ( $(this).data('get-on')=='!off' && state != $(this).data('get-off') )
                                 elem.setOn();
                        }
                    }
                    base.update_cb($(this),state);
                }
            }
        });
    }
});