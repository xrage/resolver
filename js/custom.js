/**
 * Created by xrage on 30/08/14.
 */

var myApp = new Framework7({
    pushState: true,
    swipePanel: 'left',
    onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }

});

function stripTrailingSlash(str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function get_resolved_t_id(trans){
    for (i = 0; i < trans.length; i++) {
        if (trans[i].name == "Resolve Issue")
            {
                break;
            }

    }
    return trans[i].id

}