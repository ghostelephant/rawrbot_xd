const processPitchingData = (plateAps) => {
  const pitches = plateAps.map(pa => pa.pitch);
  const buckets = new Array(10).fill(0);

  pitches.forEach(pitch => 
    buckets[Math.floor(pitch / 100) % 10]++
  );

  const maxBucketVal = Math.max(...buckets);

  let graph = "";
  buckets.forEach((val, idx) => {
    let msg = idx + "00s: ";
    for(let i = 0; i < 12; i++){
      msg += (val > 0 && val / maxBucketVal >= i / 12) ?
        "▅" : " ";
    }
    msg += `  (total: ${val})\n`;
    graph += msg
  });

  return graph;
};

module.exports = processPitchingData;