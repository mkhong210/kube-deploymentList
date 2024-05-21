let clusterData = [];
let clusterLength = 0;

async function processData() {
	try {
		getQueryParamsName();
		// fetchData 함수 호출 후 반환된 데이터를 받음
		const data = await fetchPodData(queryName);

		data.forEach(cluster => {
			// console.log(cluster.metadata.name)
			clusterData.push(cluster.metadata.name);
			clusterLength++;
		});

		// console.log(data, clusterLength)

		drawClusters(clusterData);
		drawArrows(clusterData);
			
		// 받은 데이터를 처리
		if (data) {
				console.log('Processing data:', data);
				// 다른 로직 수행
		} else {
				console.error('Failed to process data: Data is null');
		}
	} catch (error) {
			console.error('Error processing data:', error.message);
	}
}

// processData 함수 호출
processData();


// d3.js로 SVG 생성
const svg = d3.select("svg");
const svgWidth = 600;
const svgHeight = 400;

// 오리지널 클러스터
function drawOriginalCluster(cx, cy, clusterName) {
	svg.append("rect")
			.attr("x", cx - 80)
			.attr("y", cy - 40)
			.attr("width", 160)
			.attr("height", 80)
			.attr("fill", "white")
			.attr("stroke", "black")
			.attr("stroke-width", 2);

	svg.append("circle")
			.attr("cx", cx)
			.attr("cy", cy)
			.attr("r", 20)
			.attr("fill", "blue");

	svg.append("text")
			.attr("x", cx)
			.attr("y", cy + 30)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")
			.text(clusterName);
}

// 다른 클러스터
function drawOtherCluster(cx, cy, clusterName) {
  svg.append("rect")
    .attr("x", cx - 65)
    .attr("y", cy - 40)
    .attr("width", 130)
    .attr("height", 80)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  svg.append("circle")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 20)
    .attr("fill", "lightblue");

  svg.append("text")
    .attr("x", cx)
    .attr("y", cy + 30)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("font-size", "0.7rem")
    .text(clusterName);
}

const maxClustersPerRow = 4; // 한 줄에 최대 4개의 클러스터
const rowGap = 100; // 행 간의 간격
const originalX = svgWidth / 2;
const originalY = 50; 

// 클러스터를 그리는 함수
function drawClusters(clusterData) {
  drawOriginalCluster(originalX, originalY, "Original Cluster");

  const clustersPerRow = Math.min(maxClustersPerRow, clusterData.length);
  const clusterMargin = 30; // 클러스터 간의 여백

  const availableWidth = svgWidth - (clustersPerRow + 1) * clusterMargin;
  const clusterWidth = availableWidth / clustersPerRow;
  const clusterHeight = Math.min(80, clusterWidth); // 클러스터의 높이

  clusterData.forEach((clusterName, index) => {
    const row = Math.floor(index / maxClustersPerRow); // 현재 클러스터의 행
    const col = index % maxClustersPerRow; // 현재 클러스터의 열
    const cx = clusterMargin + col * (clusterWidth + clusterMargin) + clusterWidth / 2; // 클러스터의 x 좌표
    const cy = originalY + rowGap + row * (clusterHeight + rowGap) + 10; // 클러스터의 y 좌표
		// console.log(row)
		// if (row === 1) {
    //   cy -= 40; 
    // }

    drawOtherCluster(cx, cy, clusterName);
  });
}

// 화살표를 그리는 함수
function drawArrows(clusterData) {
  const clustersPerRow = Math.min(maxClustersPerRow, clusterData.length);
  const clusterGap = clusterData.length <= 4 
    ? (svgWidth - 100) / clusterData.length 
    : (svgWidth - 100) / maxClustersPerRow; // 클러스터 간의 간격 설정

  clusterData.forEach((clusterName, index) => {
    const row = Math.floor(index / maxClustersPerRow); // 현재 클러스터의 행
    const col = index % maxClustersPerRow; // 현재 클러스터의 열
    const endX = 50 + col * clusterGap + clusterGap / 2; // 클러스터의 x 좌표
    const endY = originalY + rowGap + row * (80 + rowGap) + 10; // 클러스터의 y 좌표

    svg.append("line")
      .attr("x1", originalX)
      .attr("y1", originalY + 40)
      .attr("x2", endX)
      .attr("y2", endY - 40)
      .attr("stroke", "black")
      .attr("marker-end", "url(#arrow)");
  });
}

// 클러스터 간의 화살표 추가
svg.append("defs").append("marker")
	.attr("id", "arrow")
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", 8)
	.attr("refY", 0)
	.attr("markerWidth", 6)
	.attr("markerHeight", 6)
	.attr("orient", "auto")
	.append("path")
	.attr("d", "M0,-5L10,0L0,5")
	.attr("class", "arrowHead");