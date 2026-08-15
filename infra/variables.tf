variable "aws_region" {
  description = "AWS region for the S3 bucket and Route53 changes."
  type        = string
  default     = "eu-west-1"
}

variable "domain_name" {
  description = "Fully-qualified hostname for the site, for example fuascail.example.com."
  type        = string
}

variable "hosted_zone_name" {
  description = "Route53 public hosted zone name, for example example.com."
  type        = string
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for static assets. Defaults to domain_name."
  type        = string
  default     = null
}

variable "force_destroy_bucket" {
  description = "Allow OpenTofu to delete the bucket even when objects remain."
  type        = bool
  default     = false
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "tags" {
  description = "Tags applied to supported AWS resources."
  type        = map(string)
  default = {
    Project   = "fuascail"
    ManagedBy = "opentofu"
  }
}
