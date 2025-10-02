module "vpc" {
  source = "../../modules/vpc"
  name   = "${var.project}-staging"
  cidr   = var.cidr
  azs    = ["us-east-1a","us-east-1b","us-east-1c"]
}

module "eks" {
  source          = "../../modules/eks"
  name            = "${var.project}-staging"
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets

  node_groups = {
    general = { instance_types = ["m7g.large"], min = 2, max = 10, desired = 3 }
    spotweb = { instance_types = ["m7g.large","c7g.large"], capacity_type = "SPOT", min=0, max=20, desired=2 }
  }
}

module "rds" {
  source               = "../../modules/rds-postgres"
  name                 = "${var.project}-staging"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  engine_version       = "16.3"
  instance_class       = "db.t4g.medium"
  storage_gb           = 100
  multi_az             = true
}

module "redis" {
  source          = "../../modules/elasticache-redis"
  name            = "${var.project}-staging"
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  node_type       = "cache.t4g.small"
}

module "ecr" {
  source = "../../modules/ecr"
  repos  = ["ecommerce-web","realty-web","rest-api","graphql-api"]
}

module "acm" {
  source = "../../modules/acm"
  domain = var.domain
  zone_id = var.zone_id
}

module "route53" {
  source = "../../modules/route53"
  zone_id = var.zone_id
  records = {
    "api.${var.domain}"   = module.eks.nlb_hostname  # si usas AWS LoadBalancer Controller (ALB/NLB)
    "shop.${var.domain}"  = module.eks.alb_hostname
    "realty.${var.domain}"= module.eks.alb_hostname
  }
}

module "gh_oidc" {
  source      = "../../modules/iam_gh_oidc"
  project     = var.project
  repo        = "{{projectName}}/{{projectName}}"  # GitHub org/repo
  aws_role    = "{{projectName}}-deploy-staging"
}
