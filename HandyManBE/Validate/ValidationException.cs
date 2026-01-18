using System;
using System.Collections.Generic;

namespace Validate
{
    public class ValidationException : Exception
    {
        public ValidationException(IEnumerable<string> errors)
            : base("Validation failed.")
        {
            Errors = new List<string>(errors);
        }

        public IReadOnlyList<string> Errors { get; }
    }
}
