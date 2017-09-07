using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Azure_Functions_Scale_Interface.Controllers
{
    [Route("api/[controller]")]
    public class WorkersController : Controller
    {
        [HttpGet]
        public IEnumerable<WorkerInfo> Get()
        {
            var rng = new Random();
            return Enumerable
            .Range(1, 5)
            .Select(index =>
            {
                return new WorkerInfo
                {
                    id = rng.Next().ToString(),
                    stampName = rng.Next().ToString(),
                    workerName = rng.Next().ToString(),
                    loadFactor = rng.Next().ToString(),
                    lastModifiedTimeUtc = rng.Next().ToString(),
                    isManager = true.ToString(),
                    isStale = false.ToString()
                };
            });
        }

        [HttpPost("{id}/[action]")]
        public HttpResponseMessage Add(string id)
        {
            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        [HttpDelete]
        public HttpResponseMessage Remove(string id)
        {
            return new HttpResponseMessage(HttpStatusCode.Accepted);
        }

        [HttpPost("{id}/[action]")]
        public HttpResponseMessage Ping(string id)
        {
            return new HttpResponseMessage(HttpStatusCode.Accepted);
        }


        public class WorkerInfo
        {
            public string id { get; set; }
            public string stampName { get; set; }
            public string workerName { get; set; }
            public string loadFactor { get; set; }
            public string lastModifiedTimeUtc { get; set; }
            public string isManager { get; set; }
            public string isStale { get; set; }
        }
    }
}
