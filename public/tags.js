$(function(){

  // Tag Model
  // ---------

  var Tag = Backbone.Model.extend({
    
    idAttribute:  "_id",
    clear: function(){
      this.destroy();
    }
  });


  // Tag Collection
  // -------------
  var TagList = Backbone.Collection.extend({
  
    model: Tag,
    url: '/api/tags',
    comparator: function(tag) {
      return tag.get('name');
    }
  });
  
  // The object containing all the tags created

  var Tags = new TagList;

  // The view created for each tag
  // -----------------------------

  var TagView = Backbone.View.extend({

    tagName: "li",

    template: _.template($('#item-template').html()),

    events: {
    },
    
    render: function() {
      this.$el.html(this.template({name: this.model.get('name')} ) );
      return this;
    }
    
  });


  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.

  var AppView = Backbone.View.extend({

    el: $("#tagapp"),
    // this template will be used for rendering the links
    // (see public/views/index.html
    linksTemplate: _.template($('#links-template').html()),


    events: {
      "keypress #new-link":  "goToTags",
      "keypress #link-tag":  "createOnEnter",
      "click #taglist .view": "showLinks"
    },
    
    initialize: function() {

      this.inputLink = this.$("#new-link");
      this.inputTags  = this.$("#link-tag");

      // when the page is resetted, we add all the tags
      Tags.bind('reset', this.addAll, this);
      // after a call on all the tags we render the page
      Tags.bind('all', this.render, this);

      this.main = $('#main');       // the element containing the tags 
      this.results = $('#results'); // the element containing the links

      // fetching saved tags
      Tags.fetch();

    },

    render: function() {
      if (Tags.length) {
	this.main.show();
      } else {
        this.main.hide();
      }
      
    },

    // Add a single tag item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(tag) {
      console.log('tag ' + tag.get('name')); 
      console.log('links ' + tag.get('links'));
      var view = new TagView({model: tag});
      this.$("#taglist").append(view.render().el);
    },

    // Add all items in the **Tags** collection at once.
    addAll: function() {
      this.$("#taglist").empty();
      Tags.each(this.addOne);
    },
    
    // after setting we navigate the link
    // navigate to the input for the tags element
    goToTags: function(e){
      if (e.keyCode != 13) return;
      if (!this.inputLink.val()) return;
      if (this.inputTags.val()) this.createOnEnter(e);

      this.inputTags.focus()
    },


    // If you hit return in the tags input field, create new **Tag** models,
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.inputTags.val()||!this.inputLink.val()) return;
      
      var link = this.inputLink.val();

      Tags.create({name: _.escape(this.inputTags.val()), link: _.escape(link)});

      this.inputTags.val(''); this.inputLink.val('');
      if (this.results){
	this.results.hide();
      }
      // after update refetch the tags
      Tags.fetch();
    },

    // the function that show the links 
    // for the selected tag
    // rendering the linksTemplate
    showLinks: function(e){
      console.log('unescaped ' + e.target.innerHTML);
      var links = Tags.where({name: e.target.innerHTML})[0].get('links');

      this.results.show();
      this.results.html(this.linksTemplate({name: e.target.innerHTML, links: links}));

    },



  });

  // Finally, we create the **App**.
  var App = new AppView;

});
             
