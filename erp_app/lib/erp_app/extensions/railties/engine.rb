module Rails
	Engine.class_eval do
	  def load_widgets
	    
	    widgets = []
	    engine_path = self.root.to_s
	    widget_path = File.join(self.root.to_s,"/lib/erp_app/widgets/")
	    widgets = Dir.entries(widget_path) if File.exists? widget_path
	    widgets.delete_if{|name| name =~ /^\./}
	    widgets.each do |widget|
	      require File.join(self.root.to_s,"/lib/erp_app/widgets/",widget,'base.rb')
	    end
	    
	  end
	end
end