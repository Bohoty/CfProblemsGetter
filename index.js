// Change Values Here :)
const handles = ['bohoty', 'isaacmoris', 'bedo_sayed'];
const problemsIndexes = ['E'];
const maxRating = 2400;
const problemsNumber = 100;



const axios = require('axios');
var fs = require('fs');

const getAllProblems = async () => {
	const response = await axios.get(
		'https://codeforces.com/api/problemset.problems?'
	);
	return response.data.result.problems;
};

const getUserProblems = async (user) => {
	const response = await axios.get(
		`https://codeforces.com/api/user.status?handle=${user}&from=1&count=10000`
	);
	return response.data.result;
};

const getUserAcceptedProblems = async (user) => {
	const allUserProblems = await getUserProblems(user);
	const allAcceptedProblems = allUserProblems.filter(
		(problem) => problem.verdict === 'OK'
	);
	return allAcceptedProblems.map((problem) => problem.problem);
};
const getAllAcceptedProblems = async () => {
	let allAcceptedProblems = [];
	for (let i = 0; i < handles.length; i++) {
		const curUserProblems = await getUserAcceptedProblems(handles[i]);
		allAcceptedProblems = allAcceptedProblems.concat(curUserProblems);
	}
	return allAcceptedProblems;
};

const getFileText = (wantedProblems) => {
	let string = `Problem\tWho\tNotes\n`;
	for (let i = 0; i < Math.min(problemsNumber, wantedProblems.length); i++) {
		const contestId = wantedProblems[i].contestId;
		const problemIndex = wantedProblems[i].index;
		const problemName = wantedProblems[i].name;
		const url = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
		string += `=HYPERLINK("${url}","${problemName}")\t\t\n`;
	}
	return string;
};

const writeInFile = (stringToWrite) => {
	fs.writeFile('problems.tsv', stringToWrite, function (err) {
		if (err) return console.log(err);
	});
};

const runScript = async () => {
	const allProblems = (await getAllProblems()).map((cur) =>
		JSON.stringify(cur)
	);
	const allUsersAcceptedProblems = (await getAllAcceptedProblems()).map((cur) =>
		JSON.stringify(cur)
	);
	let wantedProblems = allProblems.filter(
		(problem) => !allUsersAcceptedProblems.includes(problem)
	);
	wantedProblems = wantedProblems.map((cur) => JSON.parse(cur));
	wantedProblems = wantedProblems.filter((problem) =>
		problemsIndexes.includes(problem.index)
	);
	wantedProblems = wantedProblems.filter((problem) =>
		problem.rating <= maxRating
	);
	const stringToWrite = getFileText(wantedProblems);
	writeInFile(stringToWrite);
};
runScript();
