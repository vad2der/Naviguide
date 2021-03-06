$(function (){
    var $collections = $('#collections');
	var $all_pois = $('#all_pois');
	var $poi_list_show = $('#poi_list_show');
	
	var pointTemplate = "<tr><td>{{index}}</td>"+
		"<td><span class='noedit name'>{{poi_name}}</span><input class='edit name'></input></td>"+
		"<td><span class='noedit lat'>{{poi_lat}}</span><input class='edit lat'/></td>"+
		"<td><span class='noedit lng'>{{poi_lng}}</span><input class='edit lng'/></td>"+
		"<td><span class='noedit type'>{{poi_type}}</span><input class='edit type'/></td>"+
		"<td><span class='noedit subtype'>{{poi_subtype}}</span><input class='edit subtype'/></td>"+
		"<td><button data-id='{{poi_id}}' id='edit_button' class='noedit buttonE'>Edit</button><button data-id='{{poi_id}}' id='edit_button' class='edit buttonS'>Save</button><button data-id='{{poi_id}}' id='edit_button' class='edit buttonC'>Cancel</button></td>"+
		"<td><button data-id='{{poi_id}}' id='remove_from_collection' class='noedit'>Remove</button></td>"+
		"<td><button data-id='{{poi_id}}' id='zoom_to_point'>Zoom</button></td></tr>";
	
	var pointTemplateAll = "<tr id='poi'><td>{{index}}</td>"+
		"<td><span class='noedit name'>{{poi_name}}</span><input type='text' class='edit name'></input></td>"+
		"<td><span class='noedit lat'>{{poi_lat}}</span><input class='edit lat'/></td>"+
		"<td><span class='noedit lng'>{{poi_lng}}</span><input class='edit lng'/></td>"+
		"<td><span class='noedit type'>{{poi_type}}</span><input class='edit type'/></td>"+
		"<td><span class='noedit subtype'>{{poi_subtype}}</span><input class='edit subtype'/></td>"+
		"<td><button data-id='{{poi_id}}' id='edit_button' class='noedit buttonE'>Edit</button><button data-id='{{poi_id}}' id='edit_button' class='edit buttonS'>Save</button><button data-id='{{poi_id}}' id='edit_button' class='edit buttonC'>Cancel</button></td>"+
		"<td><button data-id={{poi_id}} id='remove' class='noedit'>Delete</button></td>"+
		"<td><button data-id={{poi_id}} id='send' class='noedit'>Send</button></td>"+
		"<td><button data-id='{{poi_id}}' id='zoom_to_point'>Zoom</button></td></tr>";
			
	var collectionDetailsTemplate = "<p class='collection'><span class='noedit name'>{{collection_name}}</span><input type='text' class='edit name'></input>"+
			"<button  data-id='{{collection_id}}' id='edit_collection_description' class='noedit buttonE'>Edit</button><button data-id='{{collection_id}}' id='save_collection_description' class='edit buttonS'>Save</button><button data-id='{{collection_id}}' class='edit buttonC'>Cancel</button></p>"+
		"<p><span class='noedit description' style='width:80%;'>{{collection_description}}</span><textarea  class='edit description' style='width:80%;'></textarea ></p>";
	
	var all_collections;
	var current_collection_of_pois;
	
    // fill collections list
    var getCollectionNames = function() {
    $.ajax({
        type: 'GET',
	    url: '/api/collections/all',
	    success: function(collections) {
			all_collections = collections;
			$('#collections').find('option').remove()
			$collections.append('<option disabled selected>..select a collection..</option>'),
			$('#zoom-button').hide(500);
			$('#del-collection').hide(500);
			$('#edit_collection_description').hide(500);
			$('#save_collection_description').hide(500);
	        $.each(collections, function (i, collection){
	            $collections.append('<option value="' + collection.collection_name + '">' + collection.collection_name + '</option>')
	        });
			$('#collection_details').empty();
			$('#poi_list_show').empty();
			setMapView([]);			
        },
        error: function() {
            alert('error loading collections');
        }
    });
  };
  $(window).load(getCollectionNames);
  //$('#collections').change(getCollectionNames);

// add a colleciton
    $('#add-collection').on('click', function() {
    
	    var new_collection = {
		    "collection_name": $('#new_col_name').val(),
		    "collection_id": '',
		    "poi_ids": [],
		};
	    $.ajax({
		    type: 'POST',
		    url: '/api/collections/'+new_collection.collection_name,
		    data: new_collection,
		    success: function(newCollection) {
			    $collections.append('<option value="' + new_collection.collection_name + '"selected>' + new_collection.collection_name + '</option>');
			    $('#new_col_name').val("Enter new collection name..")
			    updatePOIList();
		    },
		    error: function() {
			    alert('error saving collection');
		    }
	    });
    });

	var updatePOICollectioView = function (current_collection) {
		// updating collection details on click
		var $poi_list_show = $('#poi_list_show');
		var the_collection = $('#collections').val();
		$.ajax({
			type: 'GET',
			url: '/api/pois/'+the_collection,
			//data: current_collection.poi_ids,
			success: function(pois) {
				current_collection_of_pois = pois;
				$poi_list_show.empty();
				$poi_list_show.append('<tr><th>#</th><th>Name</th><th>Latitude</th><th>Longitude</th><th>Type</th><th>SubType</th><th>Edit</th><th>RemoveFromCollection</th><th>Zoom</th></tr>');
				$.each(pois, function (i, poi){
					poi.index = i+1;
					$poi_list_show.append(Mustache.render(pointTemplate, eval(poi)));
				});
				setMapView(JSON.stringify(pois));
			},
			error: function() {
				alert('error loading pois from collection');
			}
		});
	};
	
 // change poi_list on collection click
 // & display collection details
    var updatePOIList = function() {
		var the_collection = $('#collections').val();
		var $poi_list = $('#poi_list');
		var $poi_list_show = $('#poi_list_show');
		var index = 0;
		var nextIndex = function(){
			var newIndex = index + 1;
			return newIndex
		};
		$.ajax({  
			type: 'GET',
			url: '/api/collections/'+the_collection,
			success: function(current_collection) {
				//alert(JSON.stringify(current_collection));
				//current_collection = eval(current_collection)
				$('#collection_details').empty()
				$('#collection_details').append(Mustache.render(collectionDetailsTemplate, current_collection));
				$('#zoom-button').show(500);
				$('#del-collection').show(500);
				$('#edit_collection_description').show(500);
				updatePOICollectioView(current_collection);
			},
			error: function() {
				alert('error loading collection details');
			}
		});
	};
	$('#collections').change(updatePOIList);

	
	// delete collection
	 var deleteCollection = function() {
	    var del_collection = {
		    collection_name: $('#collections').val()
		};		
	    $.ajax({
		    type: 'DELETE',
		    url: '/api/collections/'+del_collection.collection_name,
		    success: function() {
				getCollectionNames();
		    },
		    error: function() {
			    alert('error deleting collection');
		    }
	    });
    };
	$('#del-collection').click(deleteCollection);
	
	// get list of all (searched points)
	var getPOIs = function() {
		//default search criteria to be developed
		var search_criteria = 'all';
		$.ajax({
		    type: 'GET',
		    url: '/api/pois/'+search_criteria,
		    success: function(pois) {
				$('#all_pois').empty();
				$all_pois.append('<tr><th>#</th><th>Name</th><th>Latitude</th><th>Longitude</th><th>Type</th><th>SubType</th><th>Edit</th><th>Delete</th><th>SendToColelction</th><th>Zoom</th></tr>');
				$.each(pois, function (i, poi){
					poi.index = i+1;
					$all_pois.append(Mustache.render(pointTemplateAll, poi));
				});	
		    },
		    error: function() {
			    alert('error getting points');
		    }
	    });
	}
	$(window).load(getPOIs);
	
    // add point
    var addPoint = function() {
	    var new_poi = {
	        poi_name: $('#new_poi_name').val(),
			poi_lat: $('#lat').val(),
			poi_lng: $('#lng').val(),
			poi_type: $('#poi_type').val(),
			poi_subtype: $('#subtype').val()
	    };
		if (newPOIcheck(new_poi)){
			$.ajax({
				type: 'POST',
				url: '/api/pois/'+new_poi,
				data: new_poi,
				success: function() {
					getPOIs();
					$('#new_poi_name').val("Enter new point name..");
					$('#lat').val("Latitude..");
					$('#lng').val("Longitude..");
					$('#poi_type').val("Type..");
					$('#subtype').val("Subtype..");
				},
				error: function() {
					alert('error adding point');
				}
			});
		}
    };
	$('#add-poi').click(addPoint);
	
	//function to check if all fields are filled properly, more soficsticated check to be implemented	
	var newPOIcheck = function (new_poi){	
		var check = true;
		if ((new_poi.poi_name.length == 0) || (new_poi.poi_name == 'Enter new point name..')){
			window.alert('Name fields is required');
			check = false;
		}
		if ((new_poi.poi_lat.length == 0) || (new_poi.poi_lat == 'Latitude..') || (isNaN(parseFloat(new_poi.poi_lat)))){
			window.alert('Latitude fields is required');
			check = false;
		}
		if ((new_poi.poi_lng.length == 0) || (new_poi.poi_lng == 'Latitude..') || (isNaN(parseFloat(new_poi.poi_lng)))){
			window.alert('Longitude fields is required');
			check = false;
		}
		if ((new_poi.poi_type.length == 0) || (new_poi.poi_type == 'Type..')){
			window.alert('Type fields is required');
			check = false;
		}
		if ((new_poi.poi_subtype.length == 0) || (new_poi.poi_subtype == 'Subtype..')){
			window.alert('Subtype fields is required');
			check = false;
		}
		return check;
	}
		
    // delete point
    var deletePoint = function(id) {	    
		var the_point ={
			poi_id: id
		};
		$.ajax({
		    type: 'DELETE',
		    url: 'api/pois/delete',
			data: the_point,
		    success: function() {
				getPOIs();
				updatePOIList();
		    },
		    error: function() {
			    alert('error deleting point');
		    }
	    });
    };
	$("#all_pois").delegate('#remove', 'click', function() {
		deletePoint($(this).attr('data-id')); 
	});
	
	// sending point to collection
	var sentPointToCollection = function(id) {
	    var the_point ={
			poi_id: id,
			action: "send"
		};
		var the_collection = {
		    name: $('#collections').val()
			};
		$.ajax({
		    type: 'PUT',
		    url: 'api/collections/'+the_collection.name,
			data: the_point,
		    success: function() {
				updatePOIList();
		    },
		    error: function() {
			    alert('error sending point to the collection');
		    }
	    });
	}
	$("#all_pois").delegate('#send', 'click', function() {
		sentPointToCollection($(this).attr('data-id')); 
	});
	
	// removing point from collection
	var removePointFromCollection = function(poi_id) {
	    var the_point ={
			poi_id: poi_id,
			action: "remove"
		};
		var the_collection = {
		    collection_name: $('#collections').val()
		};
		$.ajax({
		    type: 'PUT',
		    url: 'api/collections/'+the_collection.collection_name,
			data: the_point,
		    success: function() {
				updatePOIList();
		    },
		    error: function() {
			    alert('error removing point from the collection');
		    }
	    });
	}
	$("#poi_list_show").delegate('#remove_from_collection', 'click', function() {
		removePointFromCollection($(this).attr('data-id')); 
	});
	
	//editing a point
	var editPoint = function(tr) {
		tr.find('input.name').val(tr.find('span.name').html());
		tr.find('input.lat').val(tr.find('span.lat').html());
		tr.find('input.lng').val(tr.find('span.lng').html());
		tr.find('input.type').val(tr.find('span.type').html());
		tr.find('input.subtype').val(tr.find('span.subtype').html());
		tr.addClass('edit');
	}
	$poi_list_show.delegate('.buttonE', 'click', function() {		
		$tr = $(this).closest('tr');
		editPoint($tr); 
	});
	$all_pois.delegate('.buttonE', 'click', function() {
		$tr = $(this).closest('tr');
		editPoint($tr); 
	});
	
	//cancelling editing
	$poi_list_show.delegate('.buttonC', 'click', function() {		
		$(this).closest('tr').removeClass('edit');		
	});
	$all_pois.delegate('.buttonC', 'click', function() {		
		$(this).closest('tr').removeClass('edit');		
	});
	
	//save edits
	var saveEdits = function (tr){
		var point = {
			poi_name: tr.find('input.name').val(),
			poi_id: tr.find('button').attr('data-id'),
			poi_lat: tr.find('input.lat').val(),
			poi_lng: tr.find('input.lng').val(),
			poi_type: tr.find('input.type').val(),
			poi_subtype: tr.find('input.subtype').val()
		}
		$.ajax({
			type: 'PUT',
			url: 'api/pois/update',
			data: point,
			success:function() {
			    updatePOIList();
				getPOIs();
		    },
			error: function() {
			    alert('error saving point');
		    }
		});
	};
	$poi_list_show.delegate('.buttonS', 'click', function() {		
		$tr = $(this).closest('tr');
		saveEdits($tr)
	});
	$all_pois.delegate('.buttonS', 'click', function() {		
		$tr = $(this).closest('tr');
		saveEdits($tr)
	});
	
	// zoom on a point
	$poi_list_show.delegate('#zoom_to_point', 'click', function() {		
		$tr = $(this).closest('tr');
		var point = {
			poi_lat: $tr.find('.lat').html(),
			poi_lng: $tr.find('.lng').html()
		};
		zoomOnPoint(point);
	});
	$all_pois.delegate('#zoom_to_point', 'click', function() {		
		$tr = $(this).closest('tr');
		var point = {
			poi_lat: $tr.find('.lat').html(),
			poi_lng: $tr.find('.lng').html()
		};
		zoomOnPoint(point);
	});
	
	// zoom on a collection
	$('#collection_area').delegate('#zoom-button', 'click', updatePOIList);
	
	//update collection description text and/or name
	$cd = $('#collection_details');
	var editCollectionDetails = function(){
		$cd.find('input.name').val($cd.find('span.name').html());
		$cd.find('textarea.description').val($cd.find('span.description').html());	
		$cd.addClass('edit');
	};	
	$cd.delegate('#edit_collection_description', 'click', editCollectionDetails)
	
	// cancel edit
	$cd.delegate('.buttonC', 'click', function(){
		$cd.removeClass('edit')
	});
	
	//save edits & update collection
	$cd.delegate('.buttonS', 'click', function(){
		var collection = {
			collection_name: $cd.find('input.name').val(),
			collection_id: $cd.find('button').attr('data-id'),
			poi_ids: current_collection_of_pois.poi_ids,
			collection_description: $cd.find('textarea.description').val(),
			action: 'collection update'
		};
		$.ajax({
			type: 'PUT',
			url: '/api/collections/'+current_collection_of_pois.collection_name,
			data: collection,
			success:function() {
				$cd.removeClass('edit');
			    getCollectionNames();				
		    },
			error: function() {
			    alert('error saving collection');
		    }
		});
	});
 });