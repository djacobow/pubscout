
var image_num  = Math.ceil(Math.random() *5);
document.getElementsByClassName('hero')[0].src = 'https://cso.lbl.gov/web/clients/test/wpapi/hero-' + image_num + '.jpg';

var news = document.getElementById('news');

var doXhr = function (myURL, snippet, postLink) {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function() {
		var response = JSON.parse(this.responseText);							  
		if (snippet){
			imgURL = response.media_details.sizes.thumbnail.source_url;
			addToDom(imgURL, snippet, postLink);
		}
		else{
			response.forEach(
				function(post){
					var imgObjURL = 'https://newscenter.lbl.gov/wp-json/wp/v2/media/' + post.featured_media;
					var snippet = post.title.rendered;
					var postLink = post.link;
					doXhr(imgObjURL, snippet, postLink);     
			});
		}
	});
	xhr.open('GET', myURL, true);
	xhr.send();
};

var addToDom = function(imgURL, snippet, postLink ){
	var myItem = document.createElement("a");
	myItem.innerHTML = "<h3>"+snippet+'</h3>' +"<img src='"+imgURL+"'>";	
	myItem.className = "post";
	myItem.setAttribute('href', postLink);
	myItem.setAttribute('target', '_blank');
	news.appendChild( myItem );
};

doXhr('https://newscenter.lbl.gov/wp-json/wp/v2/posts/?per_page=3');

