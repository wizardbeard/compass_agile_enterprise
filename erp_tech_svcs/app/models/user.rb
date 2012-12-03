class User < ActiveRecord::Base
  include ErpTechSvcs::Utils::CompassAccessNegotiator
  include ActiveModel::Validations

  attr_accessor :password_validator

  belongs_to :party

  attr_accessible :email, :password, :password_confirmation
  authenticates_with_sorcery!
  has_capability_accessors

  #password validations
  validates_confirmation_of :password, :message => "should match confirmation", :if => :password
  validates :password, :presence => true, :password_strength => true, :if => :password

  #email validations
  validates :email, :presence => {:message => 'Email cannot be blank'}, :uniqueness => true
  validates_format_of :email, :with => /\b[A-Z0-9._%a-z\-]+@(?:[A-Z0-9a-z\-]+\.)+[A-Za-z]{2,4}\z/

  #username validations
  validates :username, :presence => {:message => 'Username cannot be blank'}, :uniqueness => true

  #these two methods allow us to assign instance level attributes that are not persisted.  These are used for mailers
  def instance_attributes
    @instance_attrs.nil? ? {} : @instance_attrs
  end

  def add_instance_attribute(k,v)
    @instance_attrs = {} if @instance_attrs.nil?
    @instance_attrs[k] = v
  end

  def roles
    party.security_roles
  end

  # user lives on FROM side of relationship
  def group_relationships
    PartyRelationship.where(:party_id_from => self.party.id)
  end

  # party records for the groups this user belongs to
  def group_parties
    group_relationships.all.collect{|pr| pr.to_party }
  end

  # groups this user belongs to
  def groups
    group_parties.collect{|p| p.business_party }
  end

  # roles assigned to the groups this user belongs to
  def group_roles
    groups.collect{|g| g.roles }.flatten.uniq
  end

  # composite roles for this user
  def all_roles
    (group_roles + roles).uniq
  end

  def capabilities
    capability_accessors.collect{|ca| ca.capability }.uniq.compact
  end

  def group_capabilities
    groups.collect{|r| r.capability_accessors }.flatten.uniq.collect{|ca| ca.capability }.uniq.compact
  end

  def role_capabilities
    all_roles.collect{|r| r.capability_accessors }.flatten.uniq.collect{|ca| ca.capability }.uniq.compact
  end

  def all_capabilities
    (role_capabilities + group_capabilities + capabilities).uniq
  end

  def class_capabilites_to_hash
    all_capabilities.map {|capability| 
      { :capability_type_iid => capability.capability_type.internal_identifier, 
        :capability_resource_type => capability.capability_resource_type 
      } if capability.scope_type.internal_identifier == 'class'
    }.compact
  end

end
