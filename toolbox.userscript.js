// ==UserScript==
// @name         hu.rxd.hive.toolbox
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  adds some things...
// @author       kirk
// @match        https://builds.apache.org/job/PreCommit-HIVE-Build/*/testReport/
// @match        http://sust-j3.duckdns.org:8080/**/*hive*/*/testReport/**
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// @require https://bowercdn.net/c/urijs-1.18.1/src/URI.min.js
// ==/UserScript==




(function() {
    'use strict';
    // credit:    https://stackoverflow.com/a/4673436/1525291
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                : match
                ;
            });
        };
    }


    var style = $(`<style>
.toolbox_button {
xbackground-color: lightblue;
border: 1px solid lightblue;
    color: white;
    margin:-1px;
    margin-right: 5px;
width:1em;
    text-align: center;
    text-decoration: none !IMPORTANT;
    display: inline-block;
}
.toolbox_button:hover {
background-color: lightblue;
}
</style>
`);
    $('html > head').append(style);

    //$("a[title='Show details']").css( "border", "3px double red" );

    function createLink(label,link){
        var newLink=$("<a>", {
            title: label,
            href: link,
            class: "toolbox_button"
        }).append( label );
        return newLink;
    }

    function jiraSearch(jql){
        var args = {
            jql:jql
        };
        var uri=URI('https://issues.apache.org/jira/issues/').search(args);
        return uri;
    }

    function relatedTicketsSearch(testInfo) {
        var kwPart=testInfo.keywords.map(function(kw) {
            return ' ( summary ~ "{0}" or description ~ "{0}" or description ~ "{0}.q" )'.format(kw);
        }).join("\n and ");
       return jiraSearch(kwPart + "\nand project = hive order by updated desc");
    }

    function reExecCall(testInfo){
        var args=[

            ];
        var u=URI('http://sust-j3.duckdns.org:8080/view/hive/job/hive-check/parambuild/').search(args);
        return u;
    }

    function createTestInfo(txt){
        var ret={};
        var tparts=txt.split(".");
        ret.keywords=[];
        ret.testMethod=tparts.pop();
        ret.testClassFull=tparts.join(".");
        ret.testClass=tparts.pop();
        ret.keywords.push(ret.testClass);
        var p = ret.testMethod.replace("]","").split(/\[/);
        if(p.size() == 2 ){
            ret.testParam=p.last();
            ret.keywords.push(ret.testParam);
        }
        return ret;
    }

    // $("tr:has( > td > a[title='Show details'])").css( "border", "3px double green" );
    function processFailureRow(row){
        // $(row).css( "border", "3px double brown" );
        var testLink=$(row).find("td:first-child a[href]");
        var testInfo=createTestInfo(testLink.text());

        var newLinks=[
            createLink("L",relatedTicketsSearch(testInfo)),
            createLink("R",reExecCall(testInfo)),
            ];
        newLinks.each(function (item) {
            item.insertBefore(testLink);
        });
//        testLink.css( "border", "3px double blue" );
    }

    $("tr:has( > td > a[title='Show details'])").each( function() {
        processFailureRow(this);
    });

})();
