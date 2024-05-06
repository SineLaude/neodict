var dictionary, re;
var tables = ["#results_neo", "#results_en"];

$(document).ready(function() {
	$("#searchfield").focus();
	$("#searchfield").on("keypress", function(event) {
		if(event.key === "Enter") {
			event.preventDefault;
			$("#searchbutton").click();
		}
	});

	$("body").on("keydown", function() {
		$("#searchfield").focus();
	});

	Papa.parse('data/neodict.csv', {
		download: true,
		delimiter: '|',
		skipEmptyLines: true,
		complete: function(results) {
			dictionary = results.data;
		}
	});
});

function searchNeo(entry) {
	return re.test(entry[0].toLowerCase());
}

function searchEnglish(entry) {
	return re.test(entry[1].toLowerCase());
}

function doSearch() {
	$("#searchfield").focus();
	$("#searchfield").select();

	var query = $("#searchfield").val().trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*?");

	if(query.length > 0) {
		$(".results_table").hide();
		re = new RegExp("\\b" + query + "\\b");

		var results = [[], []]
		if($("#search_neo").is(":checked"))
			results[0] = dictionary.filter(searchNeo);
		if($("#search_en").is(":checked"))
			results[1] = dictionary.filter(searchEnglish);

		if(results[0].length > 0 || results[1].length > 0) {
			$("#noresults").hide();
			$(".results_table tr:has(td)").remove();
			$(document).prop("title", $("#searchfield").val() + " - NeoDict");

			var re_start = new RegExp("^\\b" + query + "\\b");
			results.forEach(function(ra, i) {
				if(ra.length > 0) {
					var entries = [[], []];
					ra.sort(function(a, b){return a[i] < b[i] ? -1 : 1});
					ra.forEach(function(r) {
						if(re_start.test(r[i].toLowerCase()))
							entries[0].push(r);
						else
							entries[1].push(r);
					});
					entries.forEach(function(e) {
						e.forEach(function(r) {
							$(tables[i]).append("<tr><td>" + r[i] + "</td><td>" + r[1-i] + "</td></tr>");
						});
					});
					$(tables[i]).show();
				}
			});
		}
		else {
			$("#noresults").show();
			$(document).prop("title", "NeoDict");
		}
	}
}
