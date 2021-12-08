function mergeByProperty(arr1, arr2, prop) {
    _.each(arr2, function(arr2obj) {
        var arr1obj = _.find(arr1, function(arr1obj) {
            return arr1obj[prop] === arr2obj[prop];
        });
         
        //If the object already exist extend it with the new values from arr2, otherwise just add the new object to arr1
        arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
    });
}

angular.module("IUCN", [])
.filter('status_to_description', function(){
	return function(status)
	{
		var list = [
			"LC","NT","VU","EN","CR","EW","EX"
		]
		var descriptions = [
			"Least Concern",
			"Near Threatened",
			"Vulnerable",
			"Endangered",
			"Critically Endangered",
			"Extinct in the Wild",
			"Extinct"
		]
		var index = _.indexOf(list, status) 
		if(index == -1)
			return 'Unknown'
		return descriptions[index]
	}
})
.filter('status_to_img', function(){
	return function(status)
	{
		var list = [
			"LC","NT","VU","EN","CR","EW","EX"
		]
		var logo = [
			'http://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Status_iucn_LC_icon.svg/30px-Status_iucn_LC_icon.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/NT_IUCN_3_1.svg/32px-NT_IUCN_3_1.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Status_iucn_VU_icon.svg/30px-Status_iucn_VU_icon.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Status_iucn_EN_icon.svg/30px-Status_iucn_EN_icon.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Status_iucn_CR_icon.svg/30px-Status_iucn_CR_icon.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Status_iucn_EW_icon.svg/30px-Status_iucn_EW_icon.svg.png',
			'http://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Status_iucn_EX_icon.svg/30px-Status_iucn_EX_icon.svg.png'			
		]
		var index = _.indexOf(list, status) 
		if(index == -1)
			return 'https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519660-164_QuestionMark-32.png'
		return logo[index]
	}
})
.directive('iucn', function(){
	return {
		restrict:"E",
		scope:
		{
			iucn:"="
		},
		templateUrl:"component/iucn.html",
		link:function(scope, element, attrs)
		{

		}

	}
})

angular.module("Wiki", [])
.factory("WikiMeta", function(){
	var data = {
		overview:['overview'],
		names:['names','alternative names','common name', 'common names'],
		description:['description', 'appearance','anatomy','size', 'descrtiption','physical description'],
		distribution:['distribution','habitat', 'distribution and ecology', 'availability','range and range expansion', 'origin', 'distribution and habitat', 'origins'],
		aquarium:['in aquaria','aquaculture', 'life cycle', 'behavior', 'reproduction', 'in captivity', 'housing', 'behaviour', 'diet', 'sexing','breeding', 'tank mates', 'ecology','human use', 'water parameters', 'feeding', 'tank compatibility','feeding habits','characteristics', 'aquaria', 'cultivation and uses', 'invasive species', 'cultivation','in the aquarium', '§cultivation', 'invasive status', 'uses','use in aquaria'],
		other:['external links','further reading','economic importance','catching','taxonomic history' ,'agricultural pests', 'see also', '§external links', 'management efforts', '§references', 'control', 'status and threat']
	}
	var metadata =[];
	var obj = {}
	for(key in data)
	{
		metadata.push(key)
		obj[key] = [];
	}

	return {
		headerLength:30,
		data:data,
		names:metadata,
		initObject:function(){
			return obj
		},
		findMetaName:function(name)
		{
			for(key in data)
			{
				if(_.indexOf(data[key], name) != -1)
					return key
			}
			return null
		}
	}
})
.filter('is_wiki_header', function ($filter, WikiMeta) {
	return function(text)
	{
		text = text.toLowerCase();
		console.log('check header====')
		console.log(text)
		for(key in WikiMeta.data)
		{
			console.log('key:' + key)
			console.log(_.indexOf(WikiMeta.data[key], text))
			if(_.indexOf(WikiMeta.data[key], text) != -1)
				return true;
		}
		return false;
	}
})
.filter('wiki_data', function ($filter, WikiMeta){
	return function(info)
	{
		var result = WikiMeta.initObject();
		if(_.isUndefined(info) || _.isUndefined(info.wiki))
			return result
		var data = info.wiki
		
		var currentHeader = "overview"

		var group_p = {}
		group_p[currentHeader] = [];
		_.forEach(data, function(item){
			//case overview
			text = item.toLowerCase();
			var isHeader = false;
			for(key in WikiMeta.data)
			{
				if(_.indexOf(WikiMeta.data[key], text) != -1)
				{
					//item is header
					currentHeader = item;
					isHeader = true;
					group_p[currentHeader] = [];
					//result[key][result[key].length -1] = group_p
					break;
				}
			}
			if(!isHeader)
				group_p[currentHeader].push(item)
		})
		var results = {};
		var count = 0;
		for(var key in group_p)
		{
			
			var result_key = WikiMeta.findMetaName(key.toLowerCase())
			//results[key.toLowerCase()].push('yes')
			

			if(angular.isString(result_key))
			{
				if(!angular.isArray(results[result_key]))
					results[result_key] = []
				var obj = {name:key, data:group_p[key]}
				results[result_key].push(obj)
				count++
			}
		}
		if(count == 0)
			return WikiMeta.initObject()
		return results
	}
})
.filter('wiki_overview', function ($filter, WikiMeta){
	return function(info)
	{
		var results = [];
		if(!angular.isArray(info))
			return results
		for(var i=0; i < info.length;i++)
			if($filter('is_wiki_header')(info[i]))
				break;
			else
				results.push(info[i])
		return results
	}
})

angular.module("EOL", ['ngResource'])
.factory('EolPage', function ($resource){
	return $resource("http://eol.org/api/pages/1.0/:pageid.json?", {}, {
		get:{
			method:"GET", 
			params:{images:10, videos:2, sounds:0, maps:1, text:10, iucn:false, subjects:"all", licenses:"all",details:true,common_names:true,synonyms:true,references:true,vetted:0,cache_ttl:10, key:96984}			
		}

	})
}).factory('EolLocal', function ($resource){
	return $resource(':type/:name/eol.json',{},{

	})
}).filter('eol_data', function($filter) {
	return function(data)
	{
		var obj = {}
		obj.maps = $filter('filter')(data.dataObjects, {dataType:"http://purl.org/dc/dcmitype/StillImage", dataSubtype:"Map"})
		obj.images = $filter('filter')(data.dataObjects, {dataType:"http://purl.org/dc/dcmitype/StillImage", dataSubtype:"!Map"})
		obj.distribution = $filter('filter')(data.dataObjects, {subject:"http://rs.tdwg.org/ontology/voc/SPMInfoItems#GeneralDescription"})
		if(angular.isArray(obj.maps) && obj.maps.length > 0)
			obj.maps = [obj.maps[0]]
		return obj;
	}

})
.directive('eolPage', function (EolLocal, $filter, $sce){
	return {
		restrict :'E',
		scope:{
			specie:"="
		},
		transclude: true,
		templateUrl:'component/eol/page.html',
		link:function(scope, element, attrs)
		{
			
			scope.$watch('specie', function(){
				
				if(angular.isString(scope.specie.name)){
					var path_name = scope.specie.name.toLowerCase();
					path_name = path_name.replace(' ', '-')
					scope.data = EolLocal.get({type:'invertebratebase',name:path_name }, function(data){
						console.log(data.dataObjects)

						scope.maps = $filter('filter')(data.dataObjects, {dataType:"http://purl.org/dc/dcmitype/StillImage", dataSubtype:"Map"})
						scope.images = $filter('filter')(data.dataObjects, {dataType:"http://purl.org/dc/dcmitype/StillImage", dataSubtype:"!Map"})
					})

				}				
			})
	
		}
	}

}).directive("eolMap", function(){
	return {
		restrict:'E',
		scope:{
			maps:"="
		},
		templateUrl:"component/eol/map.html",
		link:function(scope,element, attrs)
		{
			
		}
	}
})

angular.module("DataService",['ngResource'])
.filter('name_to_path', function(){
	return function(name)
	{
		var path_name = name.toLowerCase();
		path_name = path_name.replace(' ', '-')
		return path_name
	}
})
.filter('query_to_params', function(){
	return function(query)
	{
		var params = {query:query}
		if(!angular.isString(params.query))
					return {}
				//split &
		var raw_params = params.query.split("&");
		var q_params ={}
		for(var i=0; i< raw_params.length;i++)
		{
			raw_param = raw_params[i].split("=")
			q_params[raw_param[0]] = raw_param[1]
		}		
		return q_params;	
	}
})
.filter('quick_search', function ($filter) {
	return function(all_fish, searcher)
		{
			var result = {};
			result.nickname = $filter('filter')(all_fish, {nickname:searcher})
			result.name =  $filter('filter')(all_fish, {name:searcher})
			result.habitat =  $filter('filter')(all_fish, {habitat:searcher})
			result.diet = $filter('filter')(all_fish, {diet:searcher})
			var tmpResult = [
				{name:'nickname', count:result.nickname.length},
				{name:'name', count:result.name.length},
				{name:'habitat', count:result.habitat.length},
				{name:'diet', count:result.diet.length},
			]				
			tmpResult = $filter('orderBy')(tmpResult, 'count', true)
			console.log(tmpResult)
			var search_result = result[tmpResult[0].name]

			for(var i=1; i < tmpResult.length;i++)
			{
				mergeByProperty(search_result, result[tmpResult[i].name])
			}
			console.log('result:' + search_result.length)
			return search_result
		}
})
.filter('species_search', function ($filter) {
	return function(all_fish, params)
	{
		console.log('=======search======')
		console.log(all_fish)
		var result = {};
		var tmpResult = [];
		var criteria = ['name','nickname', 'diet' ,'habitat','ph','min_ph','max_ph', 'size', 'min_size', 'max_size', 'temp', 'min_temp', 'max_temp' ,'dh' ,'min_dh','max_dh', 'tank_placement', 'light_needs', 'growth_rate']
		var name_dicts = ['name','nickname', 'diet' ,'habitat',["min_ph", "max_ph"],'min_ph','max_ph', ["size_min_cm", "size_max_cm"], 'size_min_cm', 'size_max_cm', ["temp_min_c", "temp_max_c"], 'temp_min_c', 'temp_max_c' ,["min_dh", "max_dh"] ,'min_dh','max_dh',  'tank_placement', 'light_needs', 'growth_rate']
		var target_type = ['size', 'ph','temp', 'dh']
		var min_type  = ['min_size', 'min_ph', 'min_temp' ,'min_dh']
		var max_type  = ['max_size', 'maxph', 'max_temp' ,'max_dh']

		for(var i =0;i <= criteria.length;i++)
		{

			
			if(angular.isString(params[criteria[i]]))
			{
				
				if(_.indexOf(target_type, criteria[i]) != -1 && !isNaN(params[criteria[i]])){
					
					var target = Number(params[criteria[i]])

					criteria_min = name_dicts[i][0]
					criteria_max =name_dicts[i][1]
					

					result[criteria[i]] = $filter('filter')(all_fish, function(fish) {
						if(target >= fish[criteria_min] && target <= fish[criteria_max])
							return true
						return false;
					})
					tmpResult.push({name:criteria[i], count:result[criteria[i]].length })
				}else if(_.indexOf(min_type, criteria[i]) != -1 && !isNaN(params[criteria[i]])){
					var criteria_min = params[criteria[i]]
					var target_name = name_dicts[i]
					console.log('find target' + target_name)
					console.log('dict')
					console.log(name_dicts[i])
					console.log("criteria_min" + criteria_min)
					result[criteria[i]] = $filter('filter')(all_fish, function(fish) {
						if(criteria_min <= fish[target_name] )
							return true
						return false;
					})
					tmpResult.push({name:criteria[i], count:result[criteria[i]].length })
				}else if(_.indexOf(max_type, criteria[i]) != -1 && !isNaN(params[criteria[i]])){
					var criteria_max = params[criteria[i]]
					var target_name = name_dicts[i]
					result[criteria[i]] = $filter('filter')(all_fish, function(fish) {
						if(criteria_max >= fish[target_name] )
							return true
						return false;
					})
					tmpResult.push({name:criteria[i], count:result[criteria[i]].length })
				}
				else 
				{
					var searcher = params[criteria[i]]
					var q = {};
					q[criteria[i]] =searcher
					
					result[criteria[i]] = $filter('filter')(all_fish, q)
					
					tmpResult.push({name:criteria[i], count:result[criteria[i]].length })
				}
			}
			
		}
		//tmpResult = $filter('orderBy')(tmpResult, 'count')
		console.log(tmpResult)
		var search_result = result[tmpResult[0].name]
		console.log(search_result)
		for(var i=1; i < tmpResult.length;i++)
		{
			//mergeByProperty(search_result, result[tmpResult[i].name])
			console.log("result --> "+tmpResult[i].name + result[tmpResult[i].name].length)
			console.log(result[tmpResult[i].name])
			search_result = _.intersection(search_result, result[tmpResult[i].name]);
		}
		console.log('result:' + search_result.length)
		return search_result
	}
})
.factory('Tank', function(){
	var storage_name = "TANK_AQUARIUM"
	var tanks = [];
	var patt = /\[[\w\W]*\]/g
	return {
		_init:function()
		{
			if(angular.isString(localStorage[storage_name]) && angular.isArray(localStorage[storage_name].match(patt)) )
				tanks = JSON.parse(localStorage[storage_name])
			else
				tanks = [];
		},
		_save:function()
		{
			localStorage[storage_name] = JSON.stringify(tanks)
		
		},
		save:function(tank, callback)
		{
			this._init();
			var index = _.findIndex(tanks, {name:tank.name})
			if(index == -1)
				tanks.push(tank)
			else
				tanks[index] = tank;
			this._save();
				callback(JSON.stringify(tanks))
		},
		load:function(callback)
		{
			this._init();
			callback(tanks)
			return tanks;
		},
		remove:function(tank, callback)
		{
			this._init();
			var index = _.findIndex(tanks, {name:tank.name})
			if(index != -1)
			{
				console.log('remove')
				_.remove(tanks, {name:tank.name})
				console.log(tanks)
				this._save();
				callback(tanks)
			}else
				callback(false)
		}


	}
})
.factory('Data', function ($resource) {
  return $resource('data/:id.json', {}, {
      query: {method:'GET', params:{'id':'all'},  isArray:true},
      	getFish:{method:'GET', params:{'id':'all'},  isArray:true},
   		getPlants:{method:'GET', params:{'id':'plant'},  isArray:true},
   		getInvertebrate:{method:'GET', params:{'id':'invertebrate'},  isArray:true},
    });
}).factory('External', function ($resource) {
	return $resource(":type/:name/:file_type.json", {}, {

	})
}).factory('Invertebrate', function (Data, $filter){
	return {
		query:function(callback)
		{
			return Data.getInvertebrate(callback);
		},
		getBasicInfo:function(params, callback)
		{
			console.log(params)
			Data.getInvertebrate(function(all_plant){
				var path = encodeURIComponent(params.path)
				path = "/" + path
				
				console.log('find:'+path)
				callback(_.find(all_plant, {path:path}))

			})
		}

	}
})
.factory('Plant', function (Data, $filter){
	return {
		query:function(callback)
		{
			return Data.getPlants(callback);
		},
		getBasicInfo:function(params, callback)
		{
			console.log(params)
			Data.getPlants(function(all_plant){
				var path = "/" + params.path

				callback(_.find(all_plant, {path:path}))

			})
		}

	}
}).factory('Fish', function (Data, External, $filter){
	return {
		query:function(callback)
		{
			return Data.getFish(callback);
		},
		getBasicInfo:function(params, callback)
		{
			console.log(params)
			Data.query(function(all_fish){
				var path = "/" + params.path

				callback(_.find(all_fish, {path:path}))

			})

		},
		_qsearch:function(all_fish, searcher)
		{
			var result = {};
			result.nickname = $filter('filter')(all_fish, {nickname:searcher})
			result.name =  $filter('filter')(all_fish, {name:searcher})
			result.habitat =  $filter('filter')(all_fish, {habitat:searcher})
			result.diet = $filter('filter')(all_fish, {diet:searcher})
			var tmpResult = [
				{name:'nickname', count:result.nickname.length},
				{name:'name', count:result.name.length},
				{name:'habitat', count:result.habitat.length},
				{name:'diet', count:result.diet.length},
			]				
			tmpResult = $filter('orderBy')(tmpResult, 'count', true)
			console.log(tmpResult)
			var search_result = result[tmpResult[0].name]

			for(var i=1; i < tmpResult.length;i++)
			{
				mergeByProperty(search_result, result[tmpResult[i].name])
			}
			console.log('result:' + search_result.length)
			return search_result
		},
		_specific_search:function (all_fish, params)
		{
			return $filter('species_search')(all_fish, params)
		},
		search:function(params, callback)
		{
			var self = this;
			Data.query(function(all_fish){
				//var path = "/" + params.path
				//?q=asia+omivore
				//asia with omivore
				if(!angular.isString(params.q))
					callback(all_fish)
				//assume no space
				var search_result = self._qsearch(all_fish, params.q)
				callback(search_result)

			})
		},
		advanceSearch:function(params, callback)
		{
			var self = this;
			Data.query(function(all_fish){
				if(!angular.isString(params.query))
					callback([])
				//split &
				var raw_params = params.query.split("&");
				var q_params ={}
				for(var i=0; i< raw_params.length;i++)
				{
					raw_param = raw_params[i].split("=")
					q_params[raw_param[0]] = raw_param[1]
				}
				var result =  self._specific_search(all_fish, q_params)
				callback(result)

			})
		}


	}


})



var app = angular.module("aquadata", [
	'ngRoute',
	'DataService',
	'infinite-scroll',
	'EOL',
	'Wiki',
	'IUCN'
]);

app.directive('ifPathStyle', function ($location){
	return {
		restrict:"A",
		scope:{
			params:"=ifPathStyle"
		},
		link:function(scope, element, attrs)
		{
			scope.updateCSS = function()
			{
				if($location.path() == scope.params[0])
					element.addClass(scope.params[1])
				else
					element.removeClass(scope.params[1])
			}

			scope.$on('$locationChangeStart', function(event) {
				scope.updateCSS();
			});
			
			
		}
	}
})

app.factory("Menu", function ($rootScope){
	var menus = [];
	var right_menus = [];
	return {
		init:function(_menus)
		{
			for(var i =0; i < _menus.length ;i++)
			{
				//console.log(_menus[i])
				if(angular.isString(_menus[i]))
				{
					path = _menus[i].toLowerCase();
					if(i!=0)
						path =  path.replace(/\s+/g, '');
					else
						path =""
					url = "/" + path

					menus[i] = {name:_menus[i], css:"inactive", path:path, url:url, class:""}
				}else if(angular.isString(_menus[i].position) && _menus[i].position == 'right'){
					path = _menus[i].name.toLowerCase();
					if(i!=0)
						path =  path.replace(/\s+/g, '');
					else
						path =""
					url = "/" + path
					var new_menu = {name:_menus[i].name, css:"inactive", path:path, url:url, class:""}
					right_menus.push(new_menu)
				}else
				{
					path = _menus[i].name.toLowerCase();
					if(i!=0)
						path =  path.replace(/\s+/g, '');
					else
						path =""
					url = "/" + path
					var subs = []
					for(var j =0; j < _menus[i].sub.length ;j++)
					{
						var sub_name = _menus[i].sub[j]
						var sub_path = path + "/" + sub_name.toLowerCase();
						var sub_url = "/" + sub_path
						subs.push({name:sub_name, css:"inactive", path:sub_path, url:sub_url})
					}
					menus[i] = {name:_menus[i].name, css:"inactive", path:path, url:url, subs:subs, class:"groupmenu", isShow:false}
				}
			}
		},
		clear:function()
		{
			for(var i =0; i < menus.length ;i++)
			{
				menus[i].css = "inactive"
			
				if(angular.isArray(menus[i].subs))
				{
					menus[i].isShow = false;
					for(var j=0; j< menus[i].subs.length; j++)
						menus[i].subs[j].css = "inactive"
				}
			}
			_.forEach(right_menus, function(item){
				item.css ="inactive"
			})
		},
		set:function(path)
		{
			path_name = path.split('/')[1]
			index = _.findIndex(menus, {path:path_name})
		
			this.clear();
			
			if(index >= 0)
			{
				menus[index].css = "active"
				if(angular.isArray(menus[index].subs))
				{
					menus[index].isShow = true;
					var split_path = path.split('/')

					if(split_path.length >= 3)
					{
						var sub_path = path_name +"/" + split_path[2]
						console.log(sub_path)
						console.log(menus[index].subs)
						var sub_index = _.findIndex(menus[index].subs, {path:sub_path})
						if(sub_index >= 0)
						menus[index].subs[sub_index].css ="active"
					}
				}
			}
			index = _.findIndex(right_menus, {path:path_name})
			
			if(index>=0)
				right_menus[index].css = "active";
			
		},
		get:function()
		{
			//return menus
			return {left:menus, right:right_menus}
		}

	}
})
app.directive('srscontent', function ($location) {
	return {
		restrict: "E",
		scope:{
			header:"@",
			content:"=",
		},
		replace:true,
		templateUrl: "component/srscontent.html",
		link: function(scope, element, attrs)
		{
			scope.$watch('content', function(newValue, oldValue)
			{
				if(angular.isArray(newValue))
					scope.items = newValue
				else if(angular.isString(newValue))
					scope.message = newValue
			})			
		}
	}
})


app.directive('imageonload', function ($parse) {
    return {
    	
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                //console.log('image is loaded');
                 $parse(scope[attrs.imageonload])();
            });
        }
    };
});

app.directive('showImage', function ($location) {
	return {
		restrict: "E",
		scope:{
			emptyImages:"=",
			onLoad:"=",
			item:"="			
		},
		replace:true,
		templateUrl: "component/image.html",
		link: function(scope, element, attrs)
		{
			if(angular.isString(attrs.onClick))
				scope.target = ""
			else if(angular.isString(attrs.href))
				scope.target = attrs.href
			else
				scope.target = "#index/species" +scope.item.path + "/"

			scope.onClick = function()
			{
				if(angular.isString(attrs.onClick))
				{
					
					
					scope.$parent[attrs.onClick](scope.item)
					
				}
					
			}

			scope.afterLoad = function()
			{
				scope.onLoad(scope.item)
				
			}
			scope.item.exist = true
			for(var i =0; i < scope.emptyImages.length;i++)
				if(scope.emptyImages[i] == scope.item.picture)
				{
					scope.item.exist = false;
					break;
				}
			
		}
	}
});

app.directive('gauge', function() {
	return {
		restrict: "E",
		scope:{
			item:"=",
			name:"@",
			color:"@",
			min:"=",
			max:"=",
			range:"="
		},
		templateUrl:"component/gauge.html",
		link:function(scope, element, attrs)
		{

		}
	}
})

app.filter('specie_name', function(){
	return function(specie)
	{
		var name = specie.name;
		name = name.toLowerCase();
		name = name.replace(" ","-")
		return name;
	}
})

app.filter('dh', function (){
	return function(value)
	{
		if(!angular.isNumber(value))
			return "Unknown"
		var dh_list = [{name:"Very Soft", max:4},{name:"Soft", max:8},{name:"Medium", max:12},{name:"Medium-Hard", max:18},{name:"Hard", max:30},{name:"Very Hard", max:99999}]
		for(var i=0; i < dh_list.length;i++){
			if(value <= dh_list[i].max)
				return dh_list[i].name
		}
		return "Unknown"
	}
})

app.filter('no_image', function ($filter) {
	return function(all_fish, emptyImages)
	{

		return $filter('filter')(all_fish, function(fish){
				for(var i =0; i < emptyImages.length;i++)
					if(emptyImages[i] == fish.picture)
					{
						return false;
						break;
					}
				return true;
			})
	}
})

//$filter('tank_limit')(tank.fish, "min_ph", "max_ph")
//check if each member have same range
app.filter('tank_limit', function (){
	return function(tank_fish, min_criteria, max_criteria)
	{
		if(tank_fish.length < 1)
			return true;
		var limit = {min:tank_fish[0][min_criteria], max:tank_fish[0][max_criteria]}
		for(var i =1; i < tank_fish.length ;i++)
		{
			if(tank_fish[i][min_criteria] > limit.min)
				limit.min = tank_fish[i][min_criteria]
			if(tank_fish[i][max_criteria] < limit.max)
				limit.max = tank_fish[i][max_criteria]
			if(limit.max - limit.min < 0)
				return false;
		}

		return true
	}
})

app.filter('ph_temp_limit', function(){
	return function(fish_result, fish_tank){
		var min_ph = _.max(fish_tank, 'min_ph')
		min_ph = min_ph.min_ph
		var max_ph = _.min(fish_tank, 'max_ph')
		max_ph = max_ph.max_ph

		var temp_min_c = _.max(fish_tank, 'temp_min_c')
		temp_min_c = temp_min_c.temp_min_c
		var temp_max_c = _.min(fish_tank, 'temp_max_c')
		temp_max_c = temp_max_c.temp_max_c
		
		fish_result = $filter('filter')(fish_result, function(fish){
			var ph_distance = max_ph - min_ph
			ph_distance = Math.min(ph_distance, fish.max_ph - fish.min_ph)
			var temp_distance = temp_max_c - temp_min_c
			temp_distance = Math.min(temp_distance, fish.temp_max_c - fish.temp_min_c)
			var con_ph1 = fish.max_ph - min_ph >= 0 && fish.max_ph - min_ph <= ph_distance
			var con_ph2 = max_ph - fish.min_ph >= 0 && max_ph - fish.min_ph  <= ph_distance
			var con_temp1 = fish.temp_max_c - temp_min_c >= 0 && fish.temp_max_c - temp_min_c <= temp_distance
			var con_temp2 = temp_max_c - fish.temp_min_c >= 0 &&  temp_max_c - fish.temp_min_c  <= temp_distance
			if(con_ph1 && con_ph2 && con_temp1 && con_temp2)
				return true
				
			return false
		})
		return fish_result;

	}


})

app.directive('scrollOnClick', function() {
  return {
    restrict: 'A',
    link: function(scope, $elm, attrs) {
      var idToScroll = attrs.href;
      $elm.on('click', function() {
        var $target;
        if (idToScroll) {
          $target = $(idToScroll);
        } else {
          $target = $elm;
        }
        $("body").animate({scrollTop: $target.offset().top}, "slow");
      });
    }
  }
});

app.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) { 
          console.log('value=',value);
          $timeout(function() {
           element[0].focus();

           // scope[attrs.focusMe] = false;
          },10);
        }
      });
    }
  };
});

var searchLink = function(scope, element, attrs)
{
	if(angular.isString(attrs.active))
		scope.isSearch = Boolean(attrs.active)
	else
		scope.isSearch = false;
	
	scope.hideToggle = false
	if(angular.isString(attrs.hideToggle))
		scope.hideToggle = Boolean(attrs.hideToggle)
	scope.query_to_q = function()
	{
		if(!(angular.isString(scope.query) && scope.query.length >0))
			return false
		var raw_q = scope.query.split("&")
		scope.q = {}
		for(var i =0; i < raw_q.length; i++)
		{
			var tmp_q = raw_q[i].split("=")
			if(isNaN( tmp_q[1]))
				scope.q[tmp_q[0]] = tmp_q[1]
			else
				scope.q[tmp_q[0]] = Number(tmp_q[1])
		}
		if( raw_q.length > 0)
			scope.isSearch = true
		
	}

	scope.search = function()
	{
		scope.query = ""
		var params = [];
		for(key in scope.q)
			if(!_.isEmpty(scope.q[key]) || angular.isNumber(scope.q[key]))
				params.push({name:key, value:scope.q[key]})
		for(var i =0; i < params.length;i++)
		{
			if(i!=0)
				scope.query += "&"	
			scope.query += params[i].name + "=" + params[i].value
			scope.callBack(scope.query)
		}
	}

	if(angular.isString(scope.query))
	{
		scope.query_to_q()
	}
	scope.$watch('query', function(){
		
		scope.query_to_q()
	})
}

app.directive('searchPlant', function(){
	return {
		
		restrict : "E",
		scope: {
			callBack:"=",
			query:"=",
			
			
		},
		replace:true,
		templateUrl:"component/searcher_plant.html",
		link: searchLink
	}
})
app.directive('search', function () {
	return {
		restrict : "E",
		scope: {
			callBack:"=",
			query:"=",
			
			
		},
		replace:true,
		templateUrl: "component/searcher.html",
		link: searchLink
	}
})

app.directive("tankForm", function(){
	return {
		restrict:"E",
		replace:true,
		templateUrl:"component/tank_form.html",
		scope:{
			tank:"="
		}
	}
})

app.directive("tankModel", function(){
	return {
		restrict:"E",
		replace:true,
		templateUrl:"component/tank_model.html",
		scope:{
			tank:"="
		},
		link:function(scope, element, attrs)
		{
			scope.tank_ratio = 100
			scope.calculate = function()
			{
				var d = scope.tank.height * scope.tank_ratio;
				var e = scope.tank.width * scope.tank_ratio;
				var f = scope.tank.depth * scope.tank_ratio;
				if(angular.isString(attrs.scale) && !isNaN(attrs.scale) )
					var g= Number(attrs.scale)
				else
					var g = 250;
				scope.scale = g;
				if(angular.isString(attrs.name))
					scope.texts = {front:attrs.name, back:"", left:"", bottom:"", right:""}
				else
					scope.texts =  {front:"Front", back:"Back", left:"Left", bottom:"Bottom", right:"Right"}

			    var i = Math.max(d, Math.max(f, e));
			    var j = g / i;
			    var k = element.outerHeight();
			    var l = element.outerHeight();
			    
			    var p = d / 6;
			    var q = (e * f * d) / 1000000;
			    d *= j;
			    e *= j;
			    f *= j;
			    scope.front_css = "width:"+ e +"px;"
			    scope.front_css += "height:" + d +"px;"
			    scope.front_css += "line-height:" + d + "px;";
			    scope.front_css += "transform:" + 'translateY(' + (l - d) + 'px) translateX(-' + (e / 2) + 'px) translateZ(' + (f / 2) + 'px);'
			   
			    scope.back_css = "width:"+ e +"px;"
			    scope.back_css += "height:" + d +"px;"
			    scope.back_css += "line-height:" + d + "px;";
			    scope.back_css += "transform:" + 'translateY(' + (l - d) + 'px) translateX(-' + (e / 2) + 'px) translateZ(' + (f / 2) + 'px) translateZ(-' + f + 'px)'
			    
			    scope.left_css = "width:" + f + "px;"
			    scope.left_css += "line-height:" + d + "px;";
			    scope.left_css += "height:" + d + "px;";
			    scope.left_css += "transform:" + 'translateY(' + (l - d) + 'px) translateX(-' + (e / 2) + 'px) translateZ(' + (f / 2) + 'px) rotateY(90deg)'
				    
   				scope.right_css = "width:" + f + "px;"
   				scope.right_css += "height:" + d + "px;"
   				scope.right_css += "line-height:" + d + "px;"
   				scope.right_css += "transform:" + 'translateY(' + (l - d) + 'px) translateX(-' + (e / 2) + 'px) translateZ(' + (f / 2) + 'px) translateX(' + e + 'px) rotateY(90deg)'

   				scope.bottom_css = "width:" + e + "px;"
   				scope.bottom_css += "height:" + f + "px;"
   				scope.bottom_css += "line-height:" + f + "px;"
   				scope.bottom_css += "transform:" + 'translateY(' + l + 'px) translateX(-' + (e / 2) + 'px) translateZ(' + (f / 2) + 'px) rotateX(270deg)';
			}
			scope.$watch('tank.width', function(){
			
				scope.calculate();
			})
			scope.$watch('tank.height', function(){
								scope.calculate();
			})
			scope.$watch('tank.depth', function(){
				
				scope.calculate();
			})
		}
	}

})

app.directive('foot', function ($location) {
	return {
		restrict: "E",
		replace:true,
		templateUrl: "component/foot.html",
	}
});
app.directive('menu', function ($location, Menu) {
	return {
		restrict: "E",
		replace:true,
		scope:{
			_menus:"=menus"
		},
		templateUrl: "component/menu.html",
		link : function(scope, element, attrs)
		{
			scope.isSearch = false;
			Menu.init(scope._menus)
			scope.menus = Menu.get();
			scope.search = function()
			{
				$location.path('/index/q=' + scope.query)

			}

			scope.getCss = function()
			{
				
				var path = $location.path() 
				Menu.set(path)
				scope.menus = Menu.get();
				
			}
			scope.checkSearch = function()
			{
				var search_patt = /\/index\/q.*/i;
				var path = $location.path()
				console.log('checkSearch')
				console.log(path)
				if(search_patt.test(path))
				{
					scope.isSearch = true;
					scope.query = path.split("q=")[1]
				}else
				{
					scope.isSearch = false;
					scope.query =""
				}
			}
			scope.getCss();
			scope.checkSearch()
			scope.$on('$locationChangeStart', function(event) {
				scope.getCss();	
				scope.checkSearch()		   
			});
		}
	}

})


app.config(function($routeProvider) {
	$routeProvider.when('/index', {
	// ...
	 templateUrl: 'pages/index.html',
	 controller: 'IndexCtrl'
	}).when('/index/fish', {
	// ...
	 templateUrl: 'pages/fish.html',
	 controller: 'FishIndexCtrl'
	}).when('/index/search/fish/:query', {
	// ...
	 templateUrl: 'pages/fish.html',
	 controller: 'FishIndexCtrl'
	}).when('/index/plant', {
		templateUrl: 'pages/plants.html',
		controller: 'PlantIndexCtrl'
	}).when('/index/search/plant/:query', {
		templateUrl: 'pages/plants.html',
		controller: 'PlantIndexCtrl'
	}).when('/index/invertebrate', {
		templateUrl: 'pages/invertebrates.html',
		controller: 'InvertebrateIndexCtrl'
	}).when('/index/search/invertebrate/:query', {
		templateUrl: 'pages/invertebrates.html',
		controller: 'InvertebrateIndexCtrl'
	}).when('/index/q=:q', {
	// ...
	 templateUrl: 'pages/index.html',
	 controller: 'IndexCtrl'
	}).when('/index/search/:query', {
	// ...
	 templateUrl: 'pages/index.html',
	 controller: 'IndexCtrl'
	}).when('/index/fish/:path', {
	// ...
	 templateUrl: 'pages/info.html',
	 controller: 'InfoCtrl'
	}).when('/index/invertebrate/:path', {
	// ...
	 templateUrl: 'pages/info_invertebrate.html',
	 controller: 'InfoInvertebrateCtrl'
	}).when('/index/plant/:path', {
	// ...
	 templateUrl: 'pages/info_plant.html',
	 controller: 'InfoPlantCtrl'
	}).when('/', {
	// ...
	 templateUrl: 'pages/home.html',
	 controller: 'HomeCtrl'
	}).when('/setupatank', {
	// ...
	 templateUrl: 'pages/setupatank.html',
	 controller: 'SetUpCtrl'
	}).when('/setupatank/analyze/:query', {
	// ...
	 templateUrl: 'pages/analyze.html',
	 controller: 'AnalyzeCtrl'
	}).when('/mytank', {
	// ...
	 templateUrl: 'pages/tanks.html',
	 controller: 'TanksCtrl'
	}).when('/mytank/:name', {
		templateUrl:'pages/analyze.html',
		controller: 'AnalyzeCtrl'
	})

});


var makeItManson = function(width, selector, gutter){
	if(angular.isNumber(width))
		columnWidth = width;
	else
		columnWidth = 280
	var query = "section.items"
	if(angular.isString(selector))
		query = selector
	var gap = 10;
	if(angular.isNumber(gutter))
		gap = gutter
	var container = document.querySelector(query);
	var msnry = new Masonry( container, {
	  // options
	  columnWidth: columnWidth,

	  itemSelector: '.item',
	  gutter: gap
	});
}

function InfoCtrl($scope, Fish, $routeParams, External)
{
	//$scope.item  = info[0];
	$scope.item ={}
	Fish.getBasicInfo({path:$routeParams.path}, function(info){
		$scope.item = info
		var ex_name = $scope.item.name.toLowerCase();
		ex_name = ex_name.replace(" ","-")
		
		$scope.srsInfo = External.get({ type:"fishbase",name:ex_name, file_type:"seriouslyfish"})
		External.query({ type:"fishbase",name:ex_name, file_type:"iucn"}, function(items){
			$scope.iucn = items[0]
		})
	})
}

function InfoPlantCtrl($scope, Plant, $routeParams, External, $filter, EolLocal)
{
	$scope.item ={}
	Plant.getBasicInfo({path:$routeParams.path}, function(info){
		$scope.item = info

		var ex_name = $scope.item.name.toLowerCase();
		ex_name = ex_name.replace(" ","-")

		$scope.info = External.get({ type:"plantbase",name:ex_name, file_type:"info"}, function(info){
			$scope.wiki_data = $filter('wiki_data')(info)			
		})
		External.query({ type:"plantbase",name:ex_name, file_type:"iucn"}, function(items){
			$scope.iucn = items[0]
		})

		var path_name = $filter('name_to_path')($scope.item.name)
		$scope.maps = [];
		$scope.eol_info = EolLocal.get({type:'plantbase',name:path_name }, function(data){
			var eol_data = $filter('eol_data')(data)
			console.log(data)
			console.log(eol_data)
			$scope.maps = eol_data.maps
			$scope.eol_images = eol_data.images
		});

	})
}

function InfoInvertebrateCtrl($scope, Invertebrate, $routeParams, External, $filter, EolLocal)
{
	$scope.item ={}

	Invertebrate.getBasicInfo({path:$routeParams.path}, function(info){
		$scope.item = info

		var ex_name = $scope.item.name.toLowerCase();
		ex_name = ex_name.replace(" ","-")
		
		$scope.info = External.get({ type:"invertebratebase",name:ex_name, file_type:"info"}, function(info){
			$scope.wiki_data = $filter('wiki_data')(info)			
		})
		External.query({ type:"invertebratebase",name:ex_name, file_type:"iucn"}, function(items){
			$scope.iucn = items[0]
		})
		var path_name = $filter('name_to_path')($scope.item.name)
		$scope.maps = [];
		$scope.eol_info = EolLocal.get({type:'invertebratebase',name:path_name }, function(data){
			var eol_data = $filter('eol_data')(data)
			$scope.maps = eol_data.maps
			$scope.eol_images = eol_data.images
		});

	})
}

function SetUpCtrl($scope, Data, $filter, $timeout, Fish, Invertebrate, Plant, Tank,$location)
{
	$scope.tank = {depth:6, width:13, height:8}
	$scope.isAnalyzeMode = false	
	$scope.tank.fish = [];
	$scope.tank.invertebrates = [];
	$scope.tank.plants = [];
	$scope.loadMax =0;
	$scope.loadSelector = "section.items"



	$scope.tank_ratio = 8
	$scope.emptyImages = ['http://www.theaquariumwiki.com/images/e/e3/No_Image.png','http://www.theaquariumwiki.com','',null,undefined, 'http://www.flowgrow.de/db/assets/images/placeholder_info.jpg']
	$scope.fish_result =[]
	$scope.invertebrate_result = []
	$scope.plant_result =[]

	$scope.fish_filter = {}
	$scope.fish_filter.isCheckVolume = false;
	$scope.fish_filter.isCheckSurface = false;
	$scope.fish_filter.isCheckPhTemp = false;

	$scope.inverte_filter = {};
	$scope.plant_filter = {};


	$scope.doSearch = function()
	{
		$scope.loadCount = 0
		Fish.advanceSearch($scope.fish_filter, function(all_fish){
			//$scope.fish_result = all_fish
			$scope.fish_result = $filter('no_image')(all_fish, $scope.emptyImages )
			if($scope.fish_filter.isCheckPhTemp && $scope.tank.fish.length > 0)
			{
				
				$scope.fish_result = $filter('ph_temp_limit')($scope.fish_result, $scope.tank.fish);

			}
			$scope.loadMax = $scope.fish_result.length
			$scope.loadSelector = "section.items"
		})
	}

	$scope.doSearchPlant = function()
	{
		$scope.loadCount = 0;

		Plant.query(function(all){
			$scope.plant_result = $filter('no_image')(all, $scope.emptyImages )
			var params = $filter('query_to_params')($scope.plant_filter.query)
			$scope.plant_result = $filter('species_search')($scope.plant_result, params)
			$scope.loadMax = $scope.plant_result.length
			$scope.loadSelector = "section.items.plant"
		})
	}

	$scope.doSearchInverte = function()
	{
		$scope.loadCount = 0;

		Invertebrate.query(function(all){
			$scope.invertebrate_result = $filter('no_image')(all, $scope.emptyImages )
			var params = $filter('query_to_params')($scope.inverte_filter.query)
			$scope.invertebrate_result = $filter('species_search')($scope.invertebrate_result, params)
			$scope.loadMax = $scope.invertebrate_result.length
			$scope.loadSelector = "section.items.invertebrate"
		})
	}

	$scope.$watch('tank.depth', function(){
		$scope.tank.min =Math.min($scope.tank.depth, $scope.tank.width)
	})
	$scope.$watch('tank.width', function(){
		$scope.tank.min =Math.min($scope.tank.depth, $scope.tank.width)
	})

	$scope.saveTank = function()
	{
		var now = new Date()
		$scope.tank.name =  Math.round($scope.tank.width )+"X" + Math.round($scope.tank.height) + "X" + Math.round($scope.tank.depth) + $filter('date')(now)
		Tank.save($scope.tank, function(string){
			console.log('save tank with:' + string)
			$location.path('/mytank/' + $scope.tank.name)
		})
	}

	$scope.doAnalyze = function()
	{
		//$scope.isAnalyzeMode = true;
		var all_species = _.union($scope.tank.fish, $scope.tank.invertebrates, $scope.tank.plants)
		$scope.tank.min_ph = _.max(all_species, "min_ph").min_ph

		$scope.tank.max_ph = _.min(all_species, "max_ph").max_ph
		$scope.tank.min_dh = _.max(all_species, "min_dh").min_dh
		$scope.tank.max_dh = _.min(all_species, "max_dh").max_dh
		
		$scope.tank.temp_min_c = _.max(all_species, "temp_min_c").temp_min_c
		$scope.tank.temp_max_c = _.min(all_species, "temp_max_c").temp_max_c
		$scope.saveTank();
	}

	$scope.isPassTankLimit = function()
	{
		var all_species = _.union($scope.tank.fish, $scope.tank.invertebrates, $scope.tank.plants)
		var isPassPh = $filter('tank_limit')(all_species, "min_ph", "max_ph")	
		var isPassTemp = $filter('tank_limit')(all_species, "temp_min_c", "temp_max_c")	
		
		return isPassPh && isPassTemp
	}

	$scope.removePlant = function(plant)
	{
		_.remove($scope.tank.plants, {name:plant.name})	
		_.forEach($scope.tank.plants, function(item,key) {
			
		 	$scope.tank.plants[key].isCompatible = $scope.isPassTankLimit()
		})
	}

	$scope.addPlant = function(plant)
	{
		if($scope.isPassTankLimit())
		{
			
			if(_.indexOf($scope.tank.plants, plant) == -1)
			{
				$scope.tank.plants.push(plant)

			}
			$scope.tank.plants[$scope.tank.plants.length -1].isCompatible = $scope.isPassTankLimit()
			
		}else
			alert("Please remove uncompatible tankmate")
	}

	$scope.removeInvertebrate = function(invertebrate)
	{
		_.remove($scope.tank.invertebrates, {name:invertebrate.name})	
		_.forEach($scope.tank.invertebrates, function(item,key) {
			
		 	$scope.tank.invertebrates[key].isCompatible = $scope.isPassTankLimit()
		})
	}

	$scope.addInvertebrate = function(invertebrate)
	{

		if($scope.isPassTankLimit())
		{
			
			if(_.indexOf($scope.tank.invertebrates, invertebrate) == -1)
			{
				$scope.tank.invertebrates.push(invertebrate)

			}
			$scope.tank.invertebrates[$scope.tank.invertebrates.length -1].isCompatible = $scope.isPassTankLimit()
			
		}else
			alert("Please remove uncompatible tankmate")
	}


	$scope.removeFish = function(fish)
	{
		
		_.remove($scope.tank.fish, {name:fish.name})	
		_.forEach($scope.tank.fish, function(item,key) {
			
		 	$scope.tank.fish[key].isCompatible = $scope.isPassTankLimit()
		})
		
	}

	$scope.addFish = function(fish)
	{
		if($scope.isPassTankLimit())
		{
			if(_.indexOf($scope.tank.fish, fish) == -1)
			{
				$scope.tank.fish.push(fish)
			}
			$scope.tank.fish[$scope.tank.fish.length -1].isCompatible = $scope.isPassTankLimit()
		}else
			alert("Please remove uncompatible tankmate")
		
		
	}


	$scope.onLoad = function()
	{
		//item width = 150
		$scope.loadCount++	
		console.log('loadCount ' + $scope.loadCount + ',' + $scope.loadMax)	
		if($scope.loadCount >= $scope.loadMax)
		{

			makeItManson(150, $scope.loadSelector);
		}
	}

	$scope.testFind = function()
	{
		var tank = $scope.tank
		$scope.gallon = tank.length * tank.deep * tank.height * 0.0043290
		$scope.litre = tank.length * tank.deep * tank.height / 61.024;
		var result1 = $filter('filter')($scope.all_data, function(fish){
			if(fish.tank_size_litre <= $scope.litre)
				return true;
			return false;
		})
		
		$scope.fish_result = $filter('filter')($scope.all_data, function(fish){
			var fish_inch = fish.size_max_cm *  0.39370
			if(fish_inch <= $scope.gallon * 2)
			{
				if(fish_inch * 20 * 0.5  <= tank.length * tank.height *  0.15500031 )
					return true;
				return false
			}
			return false;
		})
		mergeByProperty($scope.fish_result, result1, 'name')
		
		$timeout(makeItManson, $scope.fish_result.length * 10)
	}

	
}

function HomeCtrl($scope, $location)
{
	$scope.img = "bg/" + _.random(1,7) + ".jpg"
	$scope.search = function()
	{
		$location.path('index/q=' + $scope.query)
	}
}

function InvertebrateIndexCtrl($scope, Invertebrate, $routeParams, $filter, $location)
{
	$scope.items = [];
	$scope.all_items = [];
	
	Invertebrate.query(function(plants){
		$scope.all_items = plants
		$scope.items = plants
		if(angular.isString($routeParams.query)){
			$scope.query = $routeParams.query
			var params = $filter('query_to_params')($scope.query)
			$scope.items = $filter('species_search')($scope.all_items, params)
		}
	})
	$scope.doSearch = function(query)
	{
		$location.path('/index/search/invertebrate/' + query)
	}
	$scope.loadedCount = 0;
	$scope.arrangeBox = function()
	{		
		$scope.loadedCount++
		makeItManson(150)

	}
}

function PlantIndexCtrl($scope, Plant, $routeParams, $filter, $location)
{
	$scope.items = [];
	Plant.query(function(plants){
		$scope.all_items = plants;
		$scope.items = plants
		if(angular.isString($routeParams.query)){
			$scope.query = $routeParams.query
			var params = $filter('query_to_params')($scope.query)
			$scope.items = $filter('species_search')($scope.all_items, params)
		}
	})
	$scope.doSearch = function(query)
	{
		$location.path('/index/search/plant/' + query)
	}
	$scope.loadedCount = 0;
	$scope.arrangeBox = function()
	{		
			makeItManson(150)
	}

}

function FishIndexCtrl($scope, $rootScope, Data, Fish, $filter, $routeParams, $location)
{
	$scope.items =[];
	$scope.index = 0;
	$scope.view_length = 30;
	$scope.def_all_data= [];

	$scope.doSearch = function(query)
	{
		$location.path('/index/search/fish/' + query)
	}
	$scope.all_data=[]
	if(angular.isString($routeParams.q))
	{
		 Fish.search($routeParams, function(all_fish){
			$scope.all_data = all_fish
			$scope.loadContent();
		})
	}else if(angular.isString($routeParams.query)){
		$scope.query = $routeParams.query
		Fish.advanceSearch($routeParams, function(all_fish){
			$scope.all_data = all_fish
			$scope.loadContent();
		})
	}else
		$scope.all_data =  Data.query(function(){
			$scope.loadContent()
		});

	$scope.loadedCount = 0;
	$scope.view_ratio = 15;
	$scope.arrangeBox = function()
	{
			makeItManson()
	}

	$scope.loadMore = function()
	{
		if($scope.index + $scope.view_length < $scope.all_data.length)
		{
			$scope.index += $scope.view_length
			$scope.loadContent()
		}
	}

	$scope.loadContent = function()
	{
		if($scope.all_data.length == 0)
			alert("Not found")
		var to = $scope.index + $scope.view_length
		if(to >= $scope.all_data.length)
		{
			to = $scope.all_data.length 
		}	
		$scope.items =  $scope.items.concat(_.slice($scope.all_data, $scope.index, to))
	}
	
}



function IndexCtrl($scope, $rootScope, Data, Fish, $filter, $routeParams, $location, Plant, Invertebrate)
{
	$scope.items =[];
	$scope.index = 0;
	$scope.view_length = 30;
	$scope.def_all_data= [];
	$scope.all_fish = [];
	$scope.cssClass = {fish:"col-md-4 col-sm-12", plants:"col-md-4 col-sm-12", invertebrates:"col-md-4 col-sm-12"}
	$scope.doSearch = function(query)
	{
		$location.path('/index/search/' + query)
	}
	$scope.all_data=[]
	$scope.fish = [];
	$scope.plants = [];
	$scope.invertebrates = [];
	$scope.zeroCount = 0;
	$scope.checkCss = function()
	{
		var name_list = ['fish', 'plants', 'invertebrates'];
		var zeroCount = 0;
		var hideClass = "hide"
		$scope.cssClass = {fish:"col-md-4 col-sm-12", plants:"col-md-4 col-sm-12", invertebrates:"col-md-4 col-sm-12"}
		var sep_class= ["col-md-4 col-sm-12", "col-md-6 col-sm-12", "col-md-12"]
		_.forEach(name_list, function(name) {
			console.log('check ' + name)
			console.log($scope[name])
			if($scope[name].length == 0)
			{
				$scope.cssClass[name] = hideClass
				zeroCount++;
			}
		})
		console.log("zeroCount " + zeroCount)
		console.log($scope.cssClass)
		_.forEach(name_list, function(name) {
			if($scope.cssClass[name] != hideClass)
			{
				$scope.cssClass[name] = sep_class[zeroCount]
			}
		})
		$scope.zeroCount  = zeroCount
	}

	if(angular.isString($routeParams.q))
	{
		if($routeParams.q == "")
			$location.path('index')
		 Fish.search($routeParams, function(all_fish){
			
			$scope.all_fish = all_fish
			console.log('las fish')
			console.log(all_fish)
			$scope.loadContent();
			$scope.checkCss();
		})
		 Plant.query(function(plants){
		 	$scope.plants = $filter('quick_search')(plants,  $routeParams.q)
		 	$scope.checkCss();
		 })
		 Invertebrate.query(function(invertebrates){
		 	$scope.invertebrates = $filter('quick_search')(invertebrates,  $routeParams.q)
		 	$scope.checkCss();
		 })
	}else
	{	$scope.query = $routeParams.query
		var params = $filter('query_to_params')($scope.query)
		Fish.query(function(all_fish){
			
			$scope.all_fish = all_fish
			if(angular.isString($routeParams.query))
				$scope.all_fish = $filter('species_search')($scope.all_fish, params)
			
			$scope.loadContent()
			$scope.checkCss();
		});
		Plant.query(function(plants){
		 	$scope.plants = plants
		 	if(angular.isString($routeParams.query))
				$scope.plants = $filter('species_search')($scope.plants, params)
			$scope.checkCss();
		 })
		 Invertebrate.query(function(invertebrates){
		 	$scope.invertebrates = invertebrates
		 	if(angular.isString($routeParams.query))
				$scope.invertebrates = $filter('species_search')($scope.invertebrates, params)
			$scope.checkCss();
		 })
	}

	$scope.loadedCount = 0;
	$scope.view_ratio = 15;
	$scope.arrangeBox = function()
	{
		makeItManson(180,'.items.index .fish')
		makeItManson(180,'.items.index .plant')
		makeItManson(180,'.items.index .invertebrate')
	}

	$scope.loadMore = function()
	{
		if($scope.index + $scope.view_length < $scope.all_fish.length)
		{
			$scope.index += $scope.view_length
			$scope.loadContent()
		}
	}


	$scope.loadContent = function()
	{
		
		var to = $scope.index + $scope.view_length
		if(to >= $scope.all_fish.length)
		{
			to = $scope.all_fish.length 
		}	

		console.log('index ' + index + 'to ' + to)
		console.log($scope.all_fish)

		$scope.fish =  $scope.fish.concat(_.slice($scope.all_fish, $scope.index, to))
	}
	
}

function AnalyzeCtrl($scope, $location, $routeParams, Fish, Invertebrate, Plant, $filter, Tank, $location)
{
	/*var index_params = $filter('query_to_params')($routeParams.query);
	$scope.all_fish =[], $scope.all_plant = [], $scope.all_invertebrate = [];*/

	$scope.getSumInchFish = function(tank)
	{
		var cmToInch = 0.393701;
		var sum = {min:0, max:0}
		_.forEach(tank.fish, function(fish){
			sum.min += fish.size_min_cm * fish.amount;
			sum.max += fish.size_max_cm * fish.amount
		})
		sum.min = sum.min * cmToInch
		sum.max = sum.max * cmToInch;
		return sum;
	}


	$scope.getMood = function()
	{
		var moods = ["Freedom!", "Just right", "Not so comfortable", "Too crowded"]
		var colors = ["#26F7FF", "#36E574", "#face00", "#EC5022"]
		var ratios = [1.1, 1, 0.75 ,0.5]
		var sum  = $scope.getSumInchFish($scope.tank)
		var bad_mood = {color:colors[colors.length -1], mood:moods[moods.length -1 ]}
		sum = (sum.max + sum.min)/2
		var tank = $scope.tank
		var checker = (tank.width * tank.depth * tank.height * 0.0043290)/sum
		
		for(var i=0; i < ratios.length;i++){
			var ratio = ratios[i]
			if(checker >= ratio)
				return {color:colors[i], mood:moods[i]}
		}

		return bad_mood
	}


	$scope.ps = 1;
	Tank.load(function(tanks){
		$scope.tank = _.find(tanks, {name:$routeParams.name})
		$scope.def_name = $scope.tank.name
		_.forEach($scope.tank.fish, function(fish){
			fish.amount = 1;
		});
		$scope.ps = $scope.getSumInchFish($scope.tank ).min
	})
	
	$scope.updateName = function()
	{
		Tank.remove({name:$scope.def_name}, function(){

			Tank.save($scope.tank)
		})
		
	}

	$scope.deleteTank = function()
	{
		if(confirm("Are you sure to delete this tank"))
		Tank.remove($scope.tank, function(){

			$location.path('/mytank')
		})
	}
}

function TanksCtrl($scope, Tank)
{
	$scope.tanks = []

	Tank.load(function(tanks){
		$scope.tanks = tanks;
	})
}