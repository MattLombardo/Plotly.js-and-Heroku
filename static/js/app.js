function buildMetadata(sample) {

  d3.select("#sample-metadata").html(" ");
    
  var route = "/metadata/" + sample;

  d3.json(route).then(function(data){
    Object.entries(data).forEach(([key, value]) => {
      d3.select("#sample-metadata")
        .append("p")
        .text(key + ":  " + value);
    });
  });
}

function buildCharts(sample) {

  var sampleData = "/samples/" + sample;

  d3.json(sampleData).then(function(data){

    //console.log(data);

    var otu_ids = data.otu_ids;
    var otu_labels = data.otu_labels;
    var sample_values = data.sample_values;

    var OGIndex = sample_values.concat([]);
    const top_sample_values = [...sample_values].sort(function(a, b){return b - a}).slice(0,10);
    //console.log(top_sample_values);

    var indexList = []
    var dups = {};
    for (i = 0; i < top_sample_values.length; i++) {
      var ind_num;
      if(top_sample_values[i] in dups){
        ind_num = sample_values.indexOf(top_sample_values[i],dups[top_sample_values[i]] + 1);
        indexList.push(ind_num);
        dups[top_sample_values[i]] = ind_num;
      }
      else{
        ind_num = sample_values.indexOf(top_sample_values[i]);
        indexList.push(ind_num);
        dups[top_sample_values[i]] = ind_num;
      }
    }
    //console.log(indexList);
    
    var top_otu_ids = [];
    var top_otu_labels = [];
    indexList.forEach(function(index){
      top_otu_ids.push(otu_ids[index]);
      top_otu_labels.push(otu_labels[index]);
    });
    //console.log(top_otu_ids);
    //console.log(top_otu_labels);

    var tracePie = {
      labels: top_otu_ids,
      hovertext: top_otu_labels,
      values: top_sample_values,
      type: "pie"
    };

    dataPie = [tracePie];

    Plotly.newPlot("pie",dataPie);
  });

  d3.json(sampleData).then(function(data){

    var otu_ids = data.otu_ids;
    var otu_labels = data.otu_labels;
    var sample_values = data.sample_values;

    var traceBubble = {
      x: otu_ids,
      y: sample_values,
      mode: "markers",
      text: otu_labels,
      marker: {
        color: otu_ids,
        size: sample_values
      }
    };

    var layout = {
      xaxis: {
        title: "OTU ID"
      }
    };

    dataBubble = [traceBubble];

    Plotly.newPlot("bubble", dataBubble, layout)
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
