// app.js

// 데이터 저장 
let deploymentData = [];
let podsData = [];

let queryName = null;
let	queryIndex = null;

// 테이블 출력 함수
function tableCell(text){
	const cell = document.createElement('td');
	cell.textContent = text;
	return cell;
}

// parmas 값 함수 (name) - deploy_detail.html
function getQueryParamsName() {
	// URL에서 쿼리 파라미터
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	// 쿼리 파라미터 name 값
	const name = urlParams.get('name');

	queryName = name;
}

// parmas 값 함수 (num) - pod_detail.html
function getQueryParamsNum() {
	// URL에서 쿼리 파라미터
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	
	// 쿼리 파라미터 num 값
	const num = urlParams.get('num');

	queryIndex = num;
}

window.onload = function() {
	getQueryParamsName();
	getQueryParamsNum();

	// 페이지 초기화 및 데이터 호출
	if(queryName === null) {
		// console.log(queryName, queryIndex)
		if(queryIndex >= 0 && !queryIndex === null) {
			console.log(queryIndex)
			dataDirection("pod");
		} else {
			// index.html 호출
			fetchDeployments();
		}
	} else if (queryIndex === null) {
		fetchData(queryName);
		dataDirection("deployment");

	} else {
		dataDirection("pod");
	}
}

// index.html
// deployment list 데이터 호출
async function fetchDeployments() {
	const apiUrl = 'http://127.0.0.1:5001/k8s/apis/apps/v1/deployments';
	const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkduZ3VrOUE1RndVOFV5aHM0LUdDLVJrN1B4SzFEcXhrWnNibTJXbVh1NXMifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLXZiYnY3Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIxNzA1OGM0Zi1hNDdjLTQ1NGItODU1NC1kOWVkYTk3ZjNkY2MiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.LudgLlag41PH2MIu5mwVtJ9hXjgbTi-V5Gn9RJCvh3uyr-g0v6nZKOqKZdSyMFTxR1-RBL70MCP3sl6OfU0b2l7QCtLPfvw4PpY8U58_7EY-i507Egn8RPh-CZWnKll2PRySlArkcF3iFifh8dBwuLamZ3zg_28mq0X4D-1YuAff6l9JMJrVvuYo4MPLM7GqJL2c24lQL2PDugE0HGpu29PJosRaUpEKeBLktoFfOEK62qNACSgTYmQaJUmydDDckYojbLQX8BPUoXi98SXgZ2SiAdIaeL-r4fK5aCafw-IsZ6VGPHcSvD5P3JqWLYWCSm3OUvqjy0EvoiEes9uO0Q'; // Be very cautious with token security

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		displayDeployments(data.items); // 데이터 함수
		
	} catch (error) {
		console.error('Fetch error:', error);
		document.getElementById('output2').textContent = 'Error fetching data';
	}
}

// deployment list 데이터 출력 
function displayDeployments(deployments) {
	const tableBodies = document.getElementsByClassName('deploymentList');

	for (let i = 0; i < tableBodies.length; i++) {
		const tableBody = tableBodies[i];
		tableBody.innerHTML = '';

		let detailIndex = null;
		deployments.forEach(deployment => {
			const row = document.createElement('tr');

			row.classList.add('cursor-pointer', 'bg-gray-100', 'hover:bg-gray-200');
			// row.classList.add('bg-violet-500', 'hover:bg-violet-600');
			
			// console.log(index)
			row.addEventListener('click', function() {
				detailIndex = deployment.metadata.namespace;
        // 데이터를 URL 쿼리 문자열에 추가하여 디테일 페이지로 이동
				const queryString = `deploy_detail.html?name=${detailIndex}`;
				window.location.href = './page/' + queryString;
			});

			// Name
			row.appendChild(tableCell(deployment.metadata.name));

			// Namespace
			row.appendChild(tableCell(deployment.metadata.namespace));

			// Labels
			const labels = deployment.metadata.labels;
			const labelsText = labels ? Object.keys(labels).map(key => `${key}: ${labels[key]}`).join(', ') : '';
			row.appendChild(tableCell(labelsText));

			// replicas
			row.appendChild(tableCell(deployment.spec.replicas));

			tableBody.appendChild(row);
		});
	}
}


//  deployment_detail.html
// deployment detail 데이터 호출 함수
async function fetchData(paramsName) {
	const apiUrl = 'http://127.0.0.1:5001/k8s/apis/apps/v1/namespaces';
	// const apiUrl = 'http://127.0.0.1:5001/k8s/apis/apps/v1/namespaces/default/deployments';
	// const apiUrl = 'http://127.0.0.1:5001/k8s/apis/apps/v1/namespaces/local-path-storage/deployments';
	// const apiUrl = 'http://127.0.0.1:5001/k8s/apis/apps/v1/namespaces/kube-system/deployments';
	const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkduZ3VrOUE1RndVOFV5aHM0LUdDLVJrN1B4SzFEcXhrWnNibTJXbVh1NXMifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLXZiYnY3Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIxNzA1OGM0Zi1hNDdjLTQ1NGItODU1NC1kOWVkYTk3ZjNkY2MiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.LudgLlag41PH2MIu5mwVtJ9hXjgbTi-V5Gn9RJCvh3uyr-g0v6nZKOqKZdSyMFTxR1-RBL70MCP3sl6OfU0b2l7QCtLPfvw4PpY8U58_7EY-i507Egn8RPh-CZWnKll2PRySlArkcF3iFifh8dBwuLamZ3zg_28mq0X4D-1YuAff6l9JMJrVvuYo4MPLM7GqJL2c24lQL2PDugE0HGpu29PJosRaUpEKeBLktoFfOEK62qNACSgTYmQaJUmydDDckYojbLQX8BPUoXi98SXgZ2SiAdIaeL-r4fK5aCafw-IsZ6VGPHcSvD5P3JqWLYWCSm3OUvqjy0EvoiEes9uO0Q'; // Be very cautious with token security

	// let url = `${apiUrl}?limit=${limit}`;
	let url = `${apiUrl}/${paramsName}/deployments`;
	// console.log(url)

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		// document.getElementById('output2').textContent = JSON.stringify(data, null, 2);
		// displayData(data.items); // 데이터 함수

		// console.log(data)
		deploymentData = data.items[0];

		// console.log(deploymentData)
		displayDeploymentDetail(deploymentData);
	
	} catch (error) {
		console.error('Fetch error:', error);
		document.getElementById('output2').textContent = 'Error fetching data';
	}
}

// deployment detail 페이지 출력
function displayDeploymentDetail(deploymentData){
	// 필요한 정보 추출
	let deploymentName = deploymentData.metadata.name;
	let namespace = deploymentData.metadata.namespace;
	let replicas = deploymentData.status.replicas;
	let availableReplicas = deploymentData.status.availableReplicas;
	let image = deploymentData.spec.template.spec.containers[0].image;
	let labels = deploymentData.spec.selector.matchLabels;
	labels = labels ? Object.keys(labels).map(key => `${key}: ${labels[key]}`).join(', ') : '';
	let annotations = deploymentData.metadata.annotations['deployment.kubernetes.io/revision']
	
	const deploymentDesc = document.getElementById('deploymentInfo');
	// const deploymentDesc = document.querySelector('#deploymentInfo');

	// HTML에 정보 추가
	if (deploymentDesc) {
		deploymentDesc.innerHTML = `
			<p><strong>Name :</strong> ${deploymentName}</p>
			<p><strong>Namespace :</strong> ${namespace}</p>
				<div class="flex flex-wrap gap-4">
					<p><strong>Image :</strong> ${image}</p>
					<p><strong>Labels :</strong> ${labels}</p>
					<p><strong>Replicas :</strong> ${replicas}</p>
					<p><strong>Available :</strong> ${availableReplicas}</p>
					<p><strong>Annotations :</strong> ${annotations}</p>
				</div>

			`;
	} else {
			console.error("Element with id 'deploymentInfo' not found.");
	}
}

// pods 데이터 호출 함수
async function fetchPodData(paramsName) {
	const apiUrl = 'http://127.0.0.1:5001/k8s/api/v1/namespaces';
	// const apiUrl = 'http://127.0.0.1:5001/k8s/api/v1/namespaces/default/pods';
	// const apiUrl = 'http://127.0.0.1:5001/k8s/api/v1/namespaces/kube-system/pods';
	const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkduZ3VrOUE1RndVOFV5aHM0LUdDLVJrN1B4SzFEcXhrWnNibTJXbVh1NXMifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLXZiYnY3Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIxNzA1OGM0Zi1hNDdjLTQ1NGItODU1NC1kOWVkYTk3ZjNkY2MiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.LudgLlag41PH2MIu5mwVtJ9hXjgbTi-V5Gn9RJCvh3uyr-g0v6nZKOqKZdSyMFTxR1-RBL70MCP3sl6OfU0b2l7QCtLPfvw4PpY8U58_7EY-i507Egn8RPh-CZWnKll2PRySlArkcF3iFifh8dBwuLamZ3zg_28mq0X4D-1YuAff6l9JMJrVvuYo4MPLM7GqJL2c24lQL2PDugE0HGpu29PJosRaUpEKeBLktoFfOEK62qNACSgTYmQaJUmydDDckYojbLQX8BPUoXi98SXgZ2SiAdIaeL-r4fK5aCafw-IsZ6VGPHcSvD5P3JqWLYWCSm3OUvqjy0EvoiEes9uO0Q'; // Be very cautious with token security

	// let url = `${apiUrl}?limit=${limit}`;
	let url = `${apiUrl}/${paramsName}/pods`;
	// console.log(paramsName, url)
	
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		podsData = data.items;

		// console.log('1',podsData)
		// if(direction === "deployment"){
		// 	displayData(podsData)
		// } else if (direction === "pod") {
		// 	displayPodDetailData(podsData);
		// }

		return podsData;
	
	} catch (error) {
		console.error('Fetch error:', error);
		document.getElementById('output2').textContent = 'Error fetching data';
	}
}

async function dataDirection(direction) {
	const data = await fetchPodData(queryName);
	// console.log('data:',data);
	if(direction === "deployment"){
		displayData(data)
	} else if (direction === "pod") {
		// console.log(data)
		displayPodDetailData(data);
	}
}
// pods 데이터 테이블에 출력
function displayData(podsData) {
	const tableBodies = document.getElementsByClassName('podsTable');
	// console.log(podsData);

	for (let i = 0; i < tableBodies.length; i++) {
		const tableBody = tableBodies[i];
		tableBody.innerHTML = '';
		// console.log(tableBody)

		podsData.forEach((podData, index) => {
			const row = document.createElement('tr');

			row.classList.add('cursor-pointer', 'bg-gray-100', 'hover:bg-gray-200');
			// row.classList.add('bg-violet-500', 'hover:bg-violet-600');
			
			// console.log(index)
			row.addEventListener('click', function() {
				index++;
				console.log(queryName)
        // 데이터를 URL 쿼리 문자열에 추가하여 디테일 페이지로 이동
				const queryString = `pod_detail.html?name=${queryName}&num=${index}`;
				window.location.href = './' + queryString;
			});

			// Phase(state)
			row.appendChild(tableCell(podData.status.phase));

			// Name
			row.appendChild(tableCell(podData.metadata.name));

			// Labels
			const labelsText = podData.metadata.labels ? Object.keys(podData.metadata.labels).map(key => `${key}: ${podData.metadata.labels[key]}`).join(', ') : '';
			row.appendChild(tableCell(labelsText));

			// Image
			const imageUrl = podData.spec.containers[0].image;
			row.appendChild(tableCell(imageUrl));

			// Ready
			const readyStatus = podData.status.conditions[1].status;
			row.appendChild(tableCell(readyStatus));

			// IP
			row.appendChild(tableCell(podData.status.podIP));
			

			tableBody.appendChild(row);
		});
	}
}

// pod_detail.html
// pod detail 페이지 출력 
function displayPodDetailData(podData) {
	queryIndex--; 
	let detailData = podData[queryIndex];
	// console.log(podData)

	// 필요한 정보 추출
	let podName = detailData.metadata.name;
	let namespace = detailData.metadata.namespace;
	let podIP = detailData.status.podIP;
	let labels = detailData.metadata.labels;
	labels = labels ? Object.keys(labels).map(key => `${key}: ${labels[key]}`).join(', ') : '';
	let phase = detailData.status.phase;
	
	const podDetailDesc = document.getElementById('podInfo');
	// const deploymentDesc = document.querySelector('#deploymentInfo');

	displayPodtable(detailData)

	// HTML에 정보 추가
	if (podDetailDesc) {
		podDetailDesc.innerHTML = `
			<p class="text-2xl">${podName}</p>
			<p><strong>Namespace:</strong> ${namespace}</p>
				<div class="flex flex-wrap gap-4">
					<p><strong>podIP :</strong> ${podIP}</p>
					<p><strong>Labels :</strong> ${labels}</p>
					<p><strong>${phase}</strong></p>
				</div>
			`;
	} else {
			console.error("Element with id 'podInfo' not found.");
	}
}

// pod detail table 출력
function displayPodtable(tableData){
	const tableBodies = document.getElementsByClassName('containersTable');

	let detailTable = tableData.spec.containers;
	let detailphase = tableData.status.phase;

	for (let i = 0; i < tableBodies.length; i++) {
		const tableBody = tableBodies[i];
		tableBody.innerHTML = '';

		detailTable.forEach(containerData => {
			const row = document.createElement('tr');
			
			// Phase(state)
			row.appendChild(tableCell(detailphase));

			// Ready
			// const readyStatus = containerData.status.conditions[1].status;
			// row.appendChild(tableCell(readyStatus));

			// Name
			row.appendChild(tableCell(containerData.name));

			// Image
			row.appendChild(tableCell(containerData.image));

			tableBody.appendChild(row);
		});
	}
}
