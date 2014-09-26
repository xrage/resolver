/**
 * Created by xrage on 29/08/14.
 */
var scope = '';
var resolverApp = angular.module('resolverApp', ['ngRoute', 'LocalStorageModule']);

resolverApp.config(function ($routeProvider){
    $routeProvider
        .when('/settings', {
            controller : 'SettingController',
            templateUrl:'views/settings.html'
        })
        .when('/jira', {
        controller : 'JiraController',
        templateUrl:'views/jira.html'
        })
        .when('/basecamp', {
            controller : 'SettingController',
            templateUrl:'views/basecamp.html'
        })
        .otherwise({
            controller : 'SettingController',
            templateUrl:'views/jira.html'
        });
});


resolverApp.factory('JiraIssueService', function($http, localStorageService) {

    var f = {};
    f.host = localStorageService.get('JiraCreds').host;
    f.username = localStorageService.get('JiraCreds').username;
    f.password = localStorageService.get('JiraCreds').password;
    f.url = "http://127.0.0.1:8000/"+ f.host + '/rest/api/latest/search?jql=status%20in%20(Open%2C%20"In%20Progress"%2C%20Reopened)%20AND%20assignee%20in%20(' + f.username + ')%20ORDER%20BY%20due%20ASC';

    f.get_issues = function (){
        myApp.showIndicator();

        var promise =  $http({
            method: "GET",
            url: f.url,
            headers: {'Authorization' : 'Basic ' +btoa(f.username + ":" + f.password)}
        });

        promise.success(function(response){
            myApp.hideIndicator();
        });

        promise.error(function(response){
            myApp.hideIndicator();
            myApp.alert('Unable to fetch data', ['Invalid']);
        });

        return promise;
    };

    f.transition = function (issue_id){
        myApp.showIndicator();
        f.turl = "http://127.0.0.1:8000/"+ f.host +"/rest/api/latest/issue/"+issue_id+"/transitions?expand=transitions.fields";
            var promise =  $http({
            method: "GET",
            url: f.turl,
            headers: {'Authorization' : 'Basic ' +btoa(f.username + ":" + f.password)}
        });

        promise.error(function(response){
            myApp.hideIndicator();
            myApp.alert('Unable to fetch transition data', ['Invalid']);
        });

        return promise;
    };

    f.resolve_issue = function(t_response){
        f.id = get_resolved_t_id(t_response.data.transitions);
        f.r_url = f.turl + "/transitionId="+ f.id;
        data = {
            transition : {
                id :f.id
            }
        };

        var promise_res =  $http({
            method: "POST",
            url: f.r_url,
            data: data,
            headers: {'Authorization' : 'Basic ' +btoa(f.username + ":" + f.password),'Content-Type': 'application/x-www-form-urlencoded'}
        });

        promise_res.success(function(resp){
            myApp.hideIndicator();
        });

        promise_res.error(function(resp){
            myApp.alert('Unable process request', ['Invalid']);
            myApp.hideIndicator();
        });

       return promise_res;
    };


    return f;
});

resolverApp.controller('JiraController', function($scope, localStorageService, JiraIssueService) {
    $scope.head_name = "Jira Issues";
    scope = $scope;
    $scope.avatar = localStorageService.get('JiraCreds').gravatar;

    JiraIssueService.get_issues().then(function(response){
        $scope.issues = response.data.issues;
        if ($scope.issues.length>0) {
            $scope.head_name = $scope.issues[0].fields.assignee.displayName + "'s Jira Issues"
        }
        else{
            $scope.head_name = "No Issue Found"
        }
    });

    $scope.res_issue = function(issue_id){
        JiraIssueService.transition(issue_id).then(function(t_response){
                JiraIssueService.resolve_issue(t_response).then(function(r_response){
                    console.log(r_response.status)
                })
        });
    }

});





resolverApp.controller('SettingController', function($scope, localStorageService, $http){
    j_pref = localStorageService.get('JiraCreds');
    if (j_pref != undefined){
        $scope.j_username = j_pref.username;
        $scope.j_password = j_pref.password;
        $scope.j_host = j_pref.host;
    }

    $scope.j_validated = function(){
        return !($scope.j_username && $scope.j_password && $scope.j_host);
    };


    $scope.addJiraCredentials = function(){
        localStorageService.remove('JiraCreds');
        var JiraCreds = {'username': $scope.j_username,
                            'password':$scope.j_password,
                            'host' : stripTrailingSlash($scope.j_host)
                            };
        var url = "http://127.0.0.1:8000/"+JiraCreds.host +"/rest/api/latest/myself";
        myApp.showIndicator();
        $http({
            method: "GET",
            url: url,
            headers: {'Authorization' : 'Basic ' +btoa(JiraCreds.username + ":" + JiraCreds.password)}

        }).success(function(data, status, headers, config) {
            var gt = 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(data.emailAddress);
            JiraCreds['gravatar'] = gt;
            localStorageService.remove('JiraCreds');
            localStorageService.set('JiraCreds', JiraCreds);
            myApp.alert('Welcome ' + data.displayName , ['Success']);
            myApp.hideIndicator();
        }).error(function(data, status, headers, config) {
            localStorageService.remove('JiraCreds');
            myApp.alert('Invalid Credentials', ['Invalid']);
            myApp.hideIndicator();
            });

    }

    $scope.addBaseCampCredentials = function(localStorageService){
        var name = $scope.BaseCamp.name;
        var password = $scope.BaseCamp.password;
        var host = $scope.BaseCamp.host;
    }
});
