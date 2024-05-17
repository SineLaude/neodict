let dictionary, re;
const tables = ["#results_neo", "#results_en"];

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

	$("input:checkbox").on("change", function() {
		doSearch(true);
	});

	$(window).on("popstate", function(e) {
		const state = e.originalEvent.state;
		if(state) {
			$("#searchfield").val(state.q);

			doSearch(false);
		}
	});

	const sp = new URLSearchParams(location.search);
	if(sp.has("q"))
		$("#searchfield").val(sp.get("q"));

	history.replaceState({ q: $("#searchfield").val() }, "", document.location.href);

	Papa.parse('data/neodict.csv', {
		download: true,
		delimiter: '|',
		skipEmptyLines: true,
		complete: function(results) {
			dictionary = results.data;
		}
	});
});

function pushHistory() {
	const url = new URL(location);
	if($("#searchfield").val().length > 0)
		url.searchParams.set("q", $("#searchfield").val());
	else
		if(url.searchParams.has("q"))
			url.searchParams.delete("q");
	history.pushState({ q: $("#searchfield").val() }, "", url);
}

function searchNeo(entry) {
	return re.test(entry[0]);
}

function searchEnglish(entry) {
	return re.test(entry[1]);
}

function doSearch(history) {
	$("#searchfield").focus();
	$("#searchfield").select();
	$(".results_table").hide();
	$("#noresults").hide();

	if(history)
		pushHistory();

	const query_raw = $("#searchfield").val();
	const query = query_raw.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*?");

	if(query.length > 0) {
		re = new RegExp("(^|\\P{L})" + query + "($|\\P{L})", "ui");

		const results = [[], []]
		if($("#search_neo").is(":checked"))
			results[0] = dictionary.filter(searchNeo);
		if($("#search_en").is(":checked"))
			results[1] = dictionary.filter(searchEnglish);

		$(document).prop("title", query_raw + " – NeoDict");

		if(results[0].length > 0 || results[1].length > 0) {
			$(".results_table tr:has(td)").remove();

			const re_start = new RegExp("^" + query + "($|\\P{L})", "ui");
			results.forEach(function(ra, i) {
				if(ra.length > 0) {
					const entries = [[], []];
					ra.sort(function(a, b){return a[i] < b[i] ? -1 : 1});
					ra.forEach(function(r) {
						if(re_start.test(r[i]))
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
		}
	}
	else
		$(document).prop("title", "NeoDict");
}
