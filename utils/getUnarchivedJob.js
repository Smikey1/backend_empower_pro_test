
module.exports = function(jobList){
    return jobList.filter(function(job){
        return job.archive == false
    })
}