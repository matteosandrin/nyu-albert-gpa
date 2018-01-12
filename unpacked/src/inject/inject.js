var letter2gpa = {
	"A" : 4.0,
	"A-" : 3.7,
	"B+" : 3.3,
	"B" : 3.0,
	"B-" : 2.7,
	"C+" : 2.3,
	"C" : 2.0,
	"C-" : 1.7,
	"D+" : 1.3,
	"D" : 1.0,
	"F" : 0.0,
	"" : -1
}

function waitForEl(selector, callback) {
	if ($(selector).length) {
		callback();
	} else {
		setTimeout(function() {
			waitForEl(selector, callback);
		}, 100);
	}
}

function findDataPiece(label, gradesTables) {
	var pieces = [];
	$.each(gradesTables, function (i, table) {
		var pieceElements = $(table).find('td[data-label="' + label + '"]');
		$.each(pieceElements, function (j, pieceElem) {
			var piece = $(pieceElem).text();
			pieces.push(piece);
		});
	});
	return pieces;
}

function findGrades(gradesTables) {
	var grades = findDataPiece("Grade", gradesTables);
	$.each(grades, function (i, grade) {
		grades[i] = grade.trim();
	});
	return grades;
}

function findCredits(gradesTables) {
	var credits = findDataPiece("Credits", gradesTables);
	$.each(credits, function (i, credit) {
		credits[i] = Number(credit);
	});
	return credits;
}

function findCourses(gradesTables) {
	var courses = findDataPiece("Title", gradesTables);
	$.each(courses, function (i, course) {
		courses[i] = course.trim();
	});
	return courses;
}

function calculateGPA(grades, credits) {
	if (grades.length == credits.length){
		var totalGPA = 0;
		var totalCredits = 0;
		for (var i = 0; i < grades.length; i++) {
			var grade = grades[i];
			var credit = credits[i];
			if (credit != 0 && grade.length > 0) {
				var gpaGrade = letter2gpa[grade.trim()];
				totalGPA += gpaGrade * credit;
				totalCredits += credit
			}
		};
		var gpa = totalGPA / totalCredits;
		return gpa.toFixed(2).toString();
	}
	return "Error: Credits and Grades are mismatched"
}

function dsiplayCreditsTable(grades, credits, courses) {
	var totalGPA = 0;
	var totalCredits = 0;
	var table = $("<table></table>");
	table.css("margin-left","10px");
	table.css("margin-bottom","10px");
	var headers = ["Title", "Grade", "Scaled", "Credits", "Weighted"];
	var head = $("<tr></tr>")
	$.each(headers, function(i, title) {
		head.append($("<th>" + title + "</th>"));
	});
	table.append(head);
	$.each(grades, function(i, grade) {
		if (letter2gpa[grade] != -1) {
			totalGPA += letter2gpa[grade] * credits[i];
			totalCredits += credits[i];
			var row = $("<tr></tr>");
			row.append($("<td>" + courses[i] + "</td>"));
			row.append($("<td>" + grade + "</td>"));
			row.append($("<td>" + letter2gpa[grade].toFixed(2) + "</td>"));
			row.append($("<td>" + credits[i] + "</td>"));
			row.append($("<td>" + letter2gpa[grade].toFixed(2) + " × " + credits[i] + " = " + "<b>" + (letter2gpa[grade] * credits[i]).toFixed(2) + "</b></td>"));
			table.append(row);
		}
	});

	// append totals row

	var row = $("<tr></tr>");
	row.append($("<td><b>Total</b></td>"));
	row.append($("<td colspan=\"2\"></td>"));
	row.append($("<td>" + totalCredits + "</td>"));
	row.append($("<td>" + totalGPA.toFixed(2) + "</b></td>"));
	table.append(row);

	// append gpa row

	var row = $("<tr></tr>");
	row.append($("<td style=\"color: white; background-color: #57068c\"><b>GPA</b></td>"));
	row.append($("<td style=\"color: white; background-color: #57068c\" colspan=\"3\"></td>"));
	row.append($("<td style=\"color: white; background-color: #57068c\">" + totalGPA.toFixed(2) + " ÷ " + totalCredits + " = " + "<b>" + (totalGPA / totalCredits).toFixed(2) + "</b></td>"));
	table.append(row);

	
	var container = $('div[class="isSSS_CareerSelect"]')
	table.insertAfter(container);

}

function displayGPA(gpa) {
	var container = $('div[class="isSSS_CareerSelect"]')
	var gpaBox = document.createElement("div");
	gpaBox.innerHTML = "<b>GPA</b>: " + gpa;
	gpaBox.setAttribute("style","font-size: 12px; color: white; background-color: #57068c; padding-left: 10px; padding-right: 10px; margin-left: 0px; margin-right: 5px; display: inline-block; line-height: 30px;");
	container.append(gpaBox);
}

chrome.extension.sendMessage({}, function(response) {
		var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			waitForEl('table[class=" accordion-table"]', function() {
				var gradesTables = $('table[class=" accordion-table"]');
				
				var grades = findGrades(gradesTables);
				var credits = findCredits(gradesTables);
				var courses = findCourses(gradesTables);

				console.log(grades);
				console.log(credits);
				console.log(courses);

				var gpa = calculateGPA(grades,credits);
				console.log(gpa);
				displayGPA(gpa);
				dsiplayCreditsTable(grades, credits, courses);

			});

		}
	}, 10);
});